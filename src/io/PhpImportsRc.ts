import * as t from 'io-ts'
import * as z from 'io-ts-fuzzy'

import { PhpImportsConfig } from './PhpImportsConfig'


export const PhpImportsRc = t.intersection([
	t.readonly(t.strict({
		root: z.fallback(z.string, () => '.'),
		include: z.fallback(
			t.readonlyArray(z.string),
			() => [
				'src/**/*.php',
			],
		),
		exclude: z.fallback(
			t.readonlyArray(z.string),
			() => [
				'**/node_modules/**',
				'**/vendor/**',
			],
		),
	})),
	PhpImportsConfig,
])

export type PhpImportsRc = t.TypeOf<typeof PhpImportsRc>
