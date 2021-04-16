export default (source: string): string | undefined => {
	const re = /^([\t ]+)(private|public|protected)/gm
	const indents: Record<string, number> = {}

	let match
	while ((match = re.exec(source)) !== null) {
		indents[match[1]] = (indents[match[1]] ?? 0) + 1
	}

	let maxCount = 0
	let maxIndent = undefined

	for (const [indent, count] of Object.entries(indents)) {
		if (count > maxCount) {
			maxCount = count
			maxIndent = indent
		}
	}

	return maxIndent
}
