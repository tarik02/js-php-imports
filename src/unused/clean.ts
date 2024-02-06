import * as DocParser from 'doc-parser'
import * as PhpParser from 'php-parser'

import { FlatUseItem } from '../flat'


const flatten = (items: any[]): any[] => {
	const flat: any[] = []

	for (const item of items) {
		if (Array.isArray(item)) {
			flat.push(...flatten(item))
		} else {
			flat.push(item)
		}
	}

	return flat
}

const docParser = new (DocParser as any)

function* extractPhpDocTypesReferences(type: string | undefined = ''): Generator<string> {
	if (type === null || type === undefined) {
		return
	}

	for (const item of type.replace('<', '|').replace('>', '|').split('|')) {
		const trimmed = item.trim()
		if (trimmed === '' || trimmed.startsWith('\\')) {
			continue
		}

		yield trimmed.split('\\')[0]
	}
}

function* extractDocTypeReferences(node: any): Generator<string> {
	if (node === null || node === undefined) {
		return
	}

	switch (node.kind) {
	case 'doc':
		for (const subNode of node.body) {
			yield* extractDocTypeReferences(subNode)
		}
		break

	case 'type':
		yield* extractPhpDocTypesReferences(node.name)
		break

	case 'block':
		for (const option of node.options ?? []) {
			yield* extractDocTypeReferences(option)
		}
		break

	case 'return':
	case 'throws':
		yield* extractDocTypeReferences(node.what)
		break

	case 'param':
		yield* extractDocTypeReferences(node.type)
		break

	case 'annotation':
		yield* extractPhpDocTypesReferences(node.name)

		for (const argument of node.arguments ?? []) {
			yield* extractDocTypeReferences(argument)
		}
		break

	case 'class':
		yield* extractDocTypeReferences(node.class)

		for (const parameter of node.parameters ?? []) {
			yield* extractDocTypeReferences(parameter)
		}
		break

	case 'method':
		for (const argument of node.arguments ?? []) {
			yield* extractDocTypeReferences(argument)
		}
		break

	case 'word':
		yield* extractPhpDocTypesReferences(node.value)
		break

	case 'deprecated':
	case 'text':
	case 'boolean':
	case 'key':
		break

	case 'array':
		for (const value of node.value ?? []) {
			if (typeof value === 'object') {
				yield* extractDocTypeReferences(value)
			}
		}
		break
	}
}

function* extractCommentTypeReferences(node: PhpParser.Comment): Generator<string> {
	const parsed = docParser.parse(node.value)

	yield* extractDocTypeReferences(parsed)

	// HACK: find all annotations and put them here by hand because parsed does not preserve original annotation name
	const regex = /@([a-zA-Z0-9]+)/gm
	let matches

	while ((matches = regex.exec(node.value)) !== null) {
		yield matches[1]
	}
}

function* extractAttributeTypeReferences(node: PhpParser.Attribute): Generator<string> {
	yield node.name
}

const visitors: Record<string, ((node: any) => Generator<string>) | undefined> = {
	*name(node: PhpParser.Name) {
		switch (node.resolution) {
		case 'uqn':
			yield node.name
			break

		case 'qn':
			yield node.name.split('\\')[0]
			break
		}
	},

	*commentblock(node: PhpParser.CommentBlock) {
		yield* extractCommentTypeReferences(node)
	},

	*commentline(node: PhpParser.CommentLine) {
		yield* extractCommentTypeReferences(node)
	},

	*attribute(node: PhpParser.Attribute) {
		yield* extractAttributeTypeReferences(node)
	},
}

const walkTreeRecursively = (
	node: PhpParser.Node,
	callback: (node: PhpParser.Node) => void,
) => {
	callback(node)
	
	for (const value of Object.values(node)) {
		if (typeof value !== 'object' || value === null) {
			continue
		}

		if ('kind' in value) {
			walkTreeRecursively(value as PhpParser.Node, callback)
		} else if (value instanceof Array) {
			for (const subNode of flatten(value)) {
				if ('kind' in subNode) {
					walkTreeRecursively(subNode as PhpParser.Node, callback)
				}
			}
		}
	}
}

export default (source: string, items: FlatUseItem[]): FlatUseItem[] => {
	const parser = new PhpParser.Engine({
		parser: {
			extractDoc: true,
		},
	})

	const ast = parser.parseCode(source, 'source.php')

	const unusedItems = new Map<string, FlatUseItem>()
	const usedItems: FlatUseItem[] = []

	for (const item of items) {
		unusedItems.set(item.alias ?? item.name, item)
	}

	for (const rootNode of ast.children) {
		walkTreeRecursively(rootNode, node => {
			const visitor = visitors[node.kind]
			if (visitor === undefined) {
				return
			}

			for (const name of visitor(node)) {
				const item = unusedItems.get(name)

				if (item === undefined) {
					continue
				}

				unusedItems.delete(name)
				usedItems.push(item)
			}
		})
	}

	return usedItems
}
