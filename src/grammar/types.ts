import { LocationRange } from 'pegjs'

import { Modifier, Path } from '..'


export { SyntaxError } from './grammar'
export type SyntaxError = typeof SyntaxError;


export type Document = {
	namespace: Namespace | null;
	uses: Uses;
};

export type Namespace = {
	path: Path;
};

export type Uses = {
	location: LocationRange;
	items: (UseSingle | UseGroup)[];
};

export type UseSingle = {
	type: 'single';
	modifier: Modifier;
	path: Path;
	alias: Identifier | null;
};

export type UseGroup = {
	type: 'group';
	modifier: Modifier;
	path: Path;
	children: UseSingle[];
};

export type Identifier = string;
