import { Tree, TreeUseItem, TreeUseNamespace } from '../tree'
import { Modifier } from '../types'
import { Utils } from '../utils'

import { GroupUse, GroupedUses } from '.'


export type CollectCustomConfig = {
	include: Record<string, { minImports: number }>;
	exclude: string[];

	isolateModifiers: boolean;
};

const CONFIG_DEFAULTS: CollectCustomConfig = {
	include: {},
	exclude: [],

	isolateModifiers: true,
}

export default (
	input: TreeUseNamespace,
	output: GroupedUses,
	configParam: Partial<CollectCustomConfig> = {},
): void => {
	const config = { ...CONFIG_DEFAULTS, ...configParam }

	const includeEntries = Object.entries(config.include).map(([pattern, config]) => ({
		pattern: pattern.split('\\'),
		...config,
	}))
	const excludeEntries = new Utils.DefaultMap<number, string[][]>(() => [])

	config.exclude
		.map(it => it.split('\\'))
		.forEach(pattern => excludeEntries.get(pattern.length).push(pattern))

	includeEntries.sort(({ pattern: aPattern }, { pattern: bPattern }) => {
		if (aPattern.length !== bPattern.length) {
			return bPattern.length - aPattern.length
		}

		for (let i = 0, c = aPattern.length; i < c; ++i) {
			if (aPattern[i] === bPattern[i]) {
				continue
			}

			if (aPattern[i] === '**') {
				return 1
			}

			if (bPattern[i] === '**') {
				return -1
			}

			if (aPattern[i] === '*') {
				return 1
			}

			if (bPattern[i] === '*') {
				return -1
			}

			const diff = aPattern[i].localeCompare(bPattern[i])

			if (diff !== 0) {
				return diff
			}
		}

		return 0
	})

	const modifierGroups: readonly Modifier[][] = config.isolateModifiers
		? [[null], ['function'], ['const']]
		: [[null, 'function', 'const']]

	for (const entry of includeEntries) {
		for (const modifiersGroup of modifierGroups) {
			const matchesGroups = new Utils.DefaultMap<string, TreeUseItem[]>(() => [])

			for (const match of Tree.executePattern(input, entry.pattern, modifiersGroup)) {
				const groupPath = Tree.getBaseForPattern(entry.pattern, Utils.aggregatedToPath(match.aggregated)).join('\\')
				matchesGroups.get(groupPath).push(match)
			}

			for (const [base, items] of matchesGroups.entries()) {
				const baseSplitted = base.split('\\')

				if (items.length < entry.minImports) {
					continue
				}

				if (excludeEntries.get(baseSplitted.length).some(pattern => Tree.matchPattern(pattern, baseSplitted))) {
					continue
				}

				for (const match of items) {
					Tree.removeNode(input, Utils.aggregatedToPath(match.aggregated), 'item')
				}

				const groupModifier =	items.every(it => it.modifier === items[0].modifier)
					? items[0].modifier
					: null

				const group: GroupUse = {
					type: 'group',
					modifier: groupModifier,
					path: baseSplitted,
					items: items.map(item => ({
						type: 'single',
						modifier: (
							item.modifier !== groupModifier
								? item.modifier
								: null
						),
						path: Tree.getRestForPattern(entry.pattern, Utils.aggregatedToPath(item.aggregated)),
						alias: item.alias,
					})),
				}

				output.items.push(group)
			}
		}
	}
}
