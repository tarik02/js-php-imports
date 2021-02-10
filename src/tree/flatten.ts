import { TreeUseItem, TreeUseNamespace } from '.'


export default function* flatten(node: TreeUseNamespace): Generator<TreeUseItem> {
	for (const namespace of node.namespaces.values()) {
		yield* flatten(namespace)
	}

	for (const item of node.items.values()) {
		yield item
	}
}
