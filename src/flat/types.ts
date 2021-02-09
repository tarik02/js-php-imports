import { Modifier, Path } from '..'


export type FlatUseItem = {
	modifier: Modifier;
	path: Path;
	name: string;
	alias: string | null;
};
