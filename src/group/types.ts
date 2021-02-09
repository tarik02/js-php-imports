import { Modifier, Path } from '..'


export { CollectAllToSinglesConfig } from './collectAllToSingles'
export { CollectCustomConfig } from './collectCustom'
export { CollectPsr12Config } from './collectPsr12'


export type SingleUse = {
	type: 'single';
	modifier: Modifier;
	path: Path;
	alias: string | null;
};

export type GroupUse = {
	type: 'group';
	modifier: Modifier;
	path: Path;
	items: SingleUse[];
};

export type GroupedUses = {
	items: (SingleUse | GroupUse)[];
};
