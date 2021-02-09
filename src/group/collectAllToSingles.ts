import { Tree, TreeUseNamespace } from '../tree'
import { Utils } from '../utils'

import { GroupedUses } from '.'


export type CollectAllToSinglesConfig = {
};

const CONFIG_DEFAULTS: CollectAllToSinglesConfig = {
}

export default (
	input: TreeUseNamespace,
	output: GroupedUses,
	config: Partial<CollectAllToSinglesConfig> = {},
): void => {
	const {} = { ...CONFIG_DEFAULTS, ...config }

	for (const item of Tree.flatten(input)) {
		output.items.push({
			type: 'single',
			modifier: item.modifier,
			path: Utils.aggregatedToPath(item.aggregated),
			alias: item.alias,
		})
	}

	input.items.clear()
}
