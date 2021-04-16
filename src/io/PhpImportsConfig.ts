import * as t from 'io-ts'
import * as z from 'io-ts-fuzzy'


export const PhpImportsConfig = t.readonly(t.strict({
	order: z.fallbackInput(
		t.readonlyArray(t.union([
			t.literal('emptyLine'),
			t.literal('all.all'),
			t.literal('all.class'),
			t.literal('all.function'),
			t.literal('all.const'),
			t.literal('singleUses.all'),
			t.literal('singleUses.class'),
			t.literal('singleUses.function'),
			t.literal('singleUses.const'),
			t.literal('groupedUses.all'),
			t.literal('groupedUses.class'),
			t.literal('groupedUses.function'),
			t.literal('groupedUses.const'),
		])),
		() => [
			'singleUses.class',
			'emptyLine',
			'singleUses.function',
			'singleUses.const',
			'emptyLine',
			'groupedUses.class',
			'emptyLine',
			'groupedUses.function',
			'groupedUses.const',
		],
	),

	sort: z.fallbackInput(
		t.readonly(t.strict({
			order: z.fallback(
				t.union([
					t.literal('default'),
					t.literal('natural'),
				]),
				(): 'default' => 'default',
			),
			nestedOrder: z.fallback(
				t.union([
					t.literal('default'),
					t.literal('natural'),
				]),
				(): 'natural' => 'natural',
			),
		})),
		() => ({}),
	),

	print: z.fallbackInput(
		t.readonly(t.strict({
			emptyLinesAfterImports: z.fallback(z.integer, () => 1),
		})),
		() => ({}),
	),

	psr12: z.fallbackInput(
		t.readonly(t.strict({
			enable: z.fallback(z.boolean, () => true),
			isolateModifiers: z.fallback(z.boolean, () => true),
			minNestedGroupNestedUsesCount: z.fallback(z.integer, () => 1),
			minNestedGroupUsesCount: z.fallback(z.integer, () => 1),
			minGroupUsesCount: z.fallback(z.integer, () => 2),
		})),
		() => ({}),
	),

	custom: z.fallbackInput(
		t.readonly(t.strict({
			enable: z.fallback(z.boolean, () => true),
			isolateModifiers: z.fallback(z.boolean, () => true),
			include: z.fallback(
				t.record(z.string, z.fallbackInput(
					t.readonly(t.strict({
						minImports: z.fallback(z.integer, () => 1),
					})),
					() => ({}),
				)),
				() => ({}),
			),
			exclude: z.fallback(t.readonlyArray(z.string), () => []),
		})),
		() => ({}),
	),
}))

export type PhpImportsConfig = t.TypeOf<typeof PhpImportsConfig>
