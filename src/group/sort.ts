import { Utils } from '../utils'

import { GroupedUses } from '.'


export type SortConfig = {
	order: 'default' | 'natural';
	nestedOrder: 'default' | 'natural';
};

const CONFIG_DEFAULTS: SortConfig = {
	order: 'default',
	nestedOrder: 'natural',
}

export default (
	uses: GroupedUses,
	configParam: Partial<SortConfig> = {},
): void => {
	const config = { ...CONFIG_DEFAULTS, ...configParam }

	const algorithms = {
		default: Utils.comparePaths,
		natural: Utils.comparePathsWithLength,
	}

	uses.items.sort((a, b) => algorithms[config.order](a.path, b.path))

	for (const item of uses.items) {
		if (item.type === 'group') {
			item.items.sort((a, b) => algorithms[config.nestedOrder](a.path, b.path))
		}
	}
}

