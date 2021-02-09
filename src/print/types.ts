export type PrintOrder =
	| 'emptyLine'
	| 'singleUses.all'
	| 'singleUses.class'
	| 'singleUses.function'
	| 'singleUses.const'
	| 'groupedUses.all'
	| 'groupedUses.class'
	| 'groupedUses.function'
	| 'groupedUses.const'
	;

export type PrintConfig = {
	indent: string;
	order: PrintOrder[];
};
