import { Modifier } from '..'


export type TreeUseNamespace = {
	type: 'namespace';
	name: string;
	aggregated: string;
	namespaces: Map<string, TreeUseNamespace>;
	items: Map<string, TreeUseItem>;
	count: number;
};

export type TreeUseItem = {
	type: 'item';
	modifier: Modifier;
	name: string;
	aggregated: string;
	alias: string | null;
};
