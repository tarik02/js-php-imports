import { TreeUseItem, TreeUseNamespace } from '.'


export default (root: TreeUseNamespace): string => {
	let result = ''
	let indent = 0

	const enter = (node: (TreeUseNamespace | TreeUseItem)) => {
		switch (node.type) {
		case 'item':
			result += '\t'.repeat(indent)
			result += node.name
			if (node.alias) {
				result += ' as '
				result += node.alias
			}
			result += ` /* (${node.aggregated}) */`
			break

		case 'namespace':
			result += '\t'.repeat(indent)
			result += node.name
			result += '\\{'
			result += ` /* ${node.count} children (${node.aggregated}) */`
			result += '\n'
			++indent
			const items = [...node.items.values()]
			for (const item of items) {
				enter(item)
				if (item !== items[items.length - 1]) {
					result += ','
				}
				result += '\n'
			}
			--indent
			result += '\t'.repeat(indent)
			result += '}'
			break
		}
	}

	result += 'use {\n'
	++indent
	const items = [...root.items.values()]
	for (const item of items) {
		enter(item)
		if (item !== items[items.length - 1]) {
			result += ','
		}
		result += '\n'
	}
	--indent
	result += '};'

	return result
}
