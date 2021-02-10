import { Tree, TreeUseItem, TreeUseNamespace } from '../tree'
import { Path } from '../types'
import { Utils } from '../utils'

import { GroupUse, GroupedUses } from '.'


export type CollectPsr12Config = Readonly<{
	minNestedGroupNestedUsesCount: number;
	minNestedGroupUsesCount: number;

	minGroupUsesCount: number;

	isolateModifiers: boolean;
}>;

const CONFIG_DEFAULTS: CollectPsr12Config = {
	minNestedGroupNestedUsesCount: 1,
	minNestedGroupUsesCount: 1,

	minGroupUsesCount: 2,

	isolateModifiers: true,
}

export default (
	input: TreeUseNamespace,
	output: GroupedUses,
	configParam: Partial<CollectPsr12Config> = {},
): void => {
	const config = { ...CONFIG_DEFAULTS, ...configParam }

	const classSubscriptions = new Utils.DefaultMap<string, Set<TreeUseItem>>(() => new Set())
	const subgroupSubscriptions = new Utils.DefaultMap<string, Map<TreeUseItem, string>>(() => new Map())

	const getSubscriptionKeyForItem = (item: TreeUseItem, path: Path) => {
		if (config.isolateModifiers) {
			return `${path.join('\\')}::${item.modifier ?? 'default'}`
		}

		return path.join('\\')
	}

	const addSubscription = (item: TreeUseItem): void => {
		const parts = [...Utils.aggregatedToPath(item.aggregated)]

		parts.pop()
		if (parts.length === 0) {
			return
		}
		classSubscriptions.get(getSubscriptionKeyForItem(item, parts)).add(item)

		const prefix = parts.pop()!
		if (parts.length === 0) {
			return
		}
		subgroupSubscriptions.get(getSubscriptionKeyForItem(item, parts)).set(item, prefix)
	}

	const removeFromTree = (item: TreeUseItem): void => {
		const parts = [...Utils.aggregatedToPath(item.aggregated)]

		Tree.removeNode(input, parts, 'item')

		parts.pop()
		classSubscriptions.get(getSubscriptionKeyForItem(item, parts)).delete(item)

		parts.pop()
		subgroupSubscriptions.get(getSubscriptionKeyForItem(item, parts)).delete(item)
	}

	for (const item of Tree.flatten(input)) {
		addSubscription(item)
	}

	const entriesToCheck = [...classSubscriptions.entries()]
		.map(([path, items]) => ({
			path,
			parts: path.split('::')[0].split('\\'),
			items,
		}))

	entriesToCheck.sort(({ parts: a }, { parts: b }) => Utils.comparePathsWithLength(a, b))

	for (const entry of entriesToCheck) {
		if (
			subgroupSubscriptions.get(entry.path).size >= config.minNestedGroupNestedUsesCount &&
			entry.items.size >= config.minNestedGroupUsesCount
		) {
			const group: GroupUse = {
				type: 'group',
				modifier: null,
				path: entry.parts,
				items: [],
			}

			for (const [item, prefix] of subgroupSubscriptions.get(entry.path)) {
				removeFromTree(item)

				group.items.push({
					type: 'single',
					modifier: item.modifier,
					path: [prefix, item.name],
					alias: item.alias,
				})
			}

			for (const item of entry.items) {
				removeFromTree(item)

				group.items.push({
					type: 'single',
					modifier: item.modifier,
					path: [item.name],
					alias: item.alias,
				})
			}

			if (
				group.items.length !== 0 &&
				group.items.every(it => it.modifier === group.items[0].modifier)
			) {
				group.modifier = group.items[0].modifier
				for (const item of group.items) {
					item.modifier = null
				}
			}

			output.items.push(group)
		}
	}

	for (const entry of entriesToCheck) {
		if (entry.items.size >= config.minGroupUsesCount) {
			const group: GroupUse = {
				type: 'group',
				modifier: null,
				path: entry.parts,
				items: [],
			}

			for (const item of entry.items) {
				removeFromTree(item)

				group.items.push({
					type: 'single',
					modifier: item.modifier,
					path: [item.name],
					alias: item.alias,
				})
			}

			if (
				group.items.length !== 0 &&
				group.items.every(it => it.modifier === group.items[0].modifier)
			) {
				group.modifier = group.items[0].modifier
				for (const item of group.items) {
					item.modifier = null
				}
			}

			output.items.push(group)
		}
	}
}
