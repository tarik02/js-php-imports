export type PrintOrder =
	| 'emptyLine'
	| 'all.all'
	| 'all.class'
	| 'all.function'
	| 'all.const'
	| 'singleUses.all'
	| 'singleUses.class'
	| 'singleUses.function'
	| 'singleUses.const'
	| 'groupedUses.all'
	| 'groupedUses.class'
	| 'groupedUses.function'
	| 'groupedUses.const'
	;

export type PrintConfig = Readonly<{
	indent: string;
	order: ReadonlyArray<PrintOrder>;
}>;
