import { Path } from '..'

import { TreeUseNamespace } from '.'


export default (tree: TreeUseNamespace, path: Path, type: 'item' | 'namespace'): boolean => {
	let node = tree
	for (const item of path.slice(0, -1)) {
		const next = node.namespaces.get(item)

		if (!next) {
			return false
		}

		node = next
	}

	switch (type) {
	case 'namespace':
		if (!node.namespaces.delete(path[path.length - 1])) {
			return false
		}
		break

	case 'item':
		if (!node.items.delete(path[path.length - 1])) {
			return false
		}
		break
	}

	--tree.count

	node = tree
	for (const item of path.slice(0, -1)) {
		const next = node.namespaces.get(item)

		if (!next) {
			return false
		}

		--next.count

		if (next.count === 0) {
			node.namespaces.delete(item)
			break
		}

		node = next
	}

	return true
}
