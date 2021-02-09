import { TreeUseItem, TreeUseNamespace } from '.'


export default function* flatten(node: TreeUseNamespace): Generator<TreeUseItem> {
	for (const subnode of node.items.values()) {
		switch (subnode.type) {
		case 'namespace':
			yield* flatten(subnode)
			break

		case 'item':
			yield subnode
			break
		}
	}
}
