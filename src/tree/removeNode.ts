import { Path } from '..'

import { TreeUseNamespace } from '.'


export default (tree: TreeUseNamespace, path: Path): boolean => {
	let node = tree
	for (const item of path.slice(0, -1)) {
		const next = node.items.get(item)

		if (!next || next.type !== 'namespace') {
			return false
		}

		node = next
	}

	if (!node.items.delete(path[path.length - 1])) {
		return false
	}

	--tree.count

	node = tree
	for (const item of path.slice(0, -1)) {
		const next = node.items.get(item)

		if (!next || next.type !== 'namespace') {
			return false
		}

		--next.count

		if (next.count === 0) {
			node.items.delete(item)
			break
		}

		node = next
	}

	return true
}
