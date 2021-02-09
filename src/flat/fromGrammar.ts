import { Uses } from '../grammar'
import { Utils } from '../utils'

import { FlatUseItem } from '.'


export default (input: Uses): FlatUseItem[] => {
	const result: FlatUseItem[] = []

	for (const item of input.items) {
		switch (item.type) {
		case 'single':
			result.push({
				modifier: item.modifier,
				path: item.path.slice(0, -1),
				name: item.path[item.path.length - 1],
				alias: item.alias,
			})
			break

		case 'group':
			for (const subitem of item.children) {
				result.push({
					modifier: subitem.modifier ?? item.modifier,
					path: Utils.joinPaths(item.path, subitem.path.slice(0, -1)),
					name: subitem.path[subitem.path.length - 1],
					alias: subitem.alias,
				})
			}
			break
		}
	}

	return result
}
