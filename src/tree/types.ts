import { Modifier } from '..'


export type TreeUseNamespace = {
	type: 'namespace';
	name: string;
	aggregated: string;
	items: Map<string, TreeUseNamespace | TreeUseItem>;
	count: number;
};

export type TreeUseItem = {
	type: 'item';
	modifier: Modifier;
	name: string;
	aggregated: string;
	alias: string | null;
};
