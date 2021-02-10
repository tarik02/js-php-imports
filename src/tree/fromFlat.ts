import { FlatUseItem } from '../flat'

import { TreeUseNamespace } from '.'


export default (items: FlatUseItem[]): TreeUseNamespace => {
	const root: TreeUseNamespace = {
		type: 'namespace',
		name: '',
		aggregated: '',
		namespaces: new Map(),
		items: new Map(),
		count: 0,
	}

	const namespaces = new Map<string, TreeUseNamespace>()

	for (const item of items) {
		let aggregatedPath = ''
		let parent = root
		++parent.count

		for (const slice of item.path) {
			aggregatedPath += `\\${slice}`

			let namespace = namespaces.get(aggregatedPath)
			if (! namespace) {
				namespace = {
					type: 'namespace',
					name: slice,
					aggregated: aggregatedPath,
					namespaces: new Map(),
					items: new Map(),
					count: 0,
				}
				namespaces.set(aggregatedPath, namespace)
				parent.namespaces.set(slice, namespace)
			}

			parent = namespace
			++parent.count
		}

		parent.items.set(item.name, {
			type: 'item',
			modifier: item.modifier,
			name: item.name,
			aggregated: `${parent.aggregated}\\${item.name}`,
			alias: item.alias,
		})
	}

	return root
}
