import * as PhpImports from '.'
import { PhpImportsConfig } from './io/PhpImportsConfig'


export type TextProcessorResult = {
	start: number
	end: number
	replacement: string
}

export type TextProcessorDelegate = {
	onWarning?: (description: string, error: Error | string | undefined) => void,
}

export const processText = (
	text: string,
	config: PhpImportsConfig,
	indent: string | undefined = undefined,
	delegate: TextProcessorDelegate | undefined = undefined,
): TextProcessorResult | undefined => {
	if (indent === undefined) {
		indent = PhpImports.Utils.detectIndent(text) ?? '    '
	}

	const document = PhpImports.Grammar.fromSource(text)

	let flat = PhpImports.Flat.fromGrammar(document.uses)

	if (flat.length === 0) {
		return undefined
	}

	if (config.unused.enable) {
		try {
			flat = PhpImports.Unused.clean(text, flat)
		} catch (e) {
			delegate?.onWarning?.(
				'Failed to analyze unused imports',
				e as any,
			)
		}
	}

	const tree = PhpImports.Tree.fromFlat(flat)

	const grouped = PhpImports.Group.create()

	if (config.psr12.enable) {
		PhpImports.Group.collectPsr12(tree, grouped, {
			minNestedGroupNestedUsesCount: config.psr12.minNestedGroupNestedUsesCount,
			minNestedGroupUsesCount: config.psr12.minNestedGroupUsesCount,
			minGroupUsesCount: config.psr12.minGroupUsesCount,
			isolateModifiers: config.psr12.isolateModifiers,
		})
	}

	if (config.custom.enable) {
		PhpImports.Group.collectCustom(tree, grouped, {
			include: config.custom.include,
			exclude: config.custom.exclude,
		})
	}

	PhpImports.Group.collectAllToSingles(tree, grouped)

	PhpImports.Group.sort(grouped, {
		order: config.sort.order,
		nestedOrder: config.sort.nestedOrder,
	})

	const printed = PhpImports.Print.print(grouped, {
		order: config.order,
		indent,
		wrap: config.print.wrap,
	})

	const prefix = text.substring(0, document.uses.location.start.offset)
	const suffix = text.substring(document.uses.location.end.offset)

	const startOffset = document.uses.location.start.offset - (prefix.length - prefix.trimEnd().length)
	const endOffset = document.uses.location.end.offset + (suffix.length - suffix.trimStart().length)

	const emptyLinesAfterImports = config.print.emptyLinesAfterImports

	const replacement = `\n\n${printed}\n` + '\n'.repeat(emptyLinesAfterImports)

	if (text.substring(startOffset, endOffset) === replacement) {
		return undefined
	}

	return {
		start: startOffset,
		end: endOffset,
		replacement,
	}
}
