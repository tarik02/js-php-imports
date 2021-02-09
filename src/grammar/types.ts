// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="grammar.d.ts" />

import { LocationRange } from 'pegjs'

import { Modifier, Path } from '..'

import * as parser from './grammar.peg'


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


// eslint-disable-next-line @typescript-eslint/naming-convention
export const SyntaxError = parser.SyntaxError
export type SyntaxError = typeof SyntaxError;
