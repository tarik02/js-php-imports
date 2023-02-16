export default (source: string): string | undefined => {
	const lines = source.split('\n')

	let i = 0
	const c = lines.length

	for (; i < c; ++i) {
		if (lines[i].endsWith('{')) {
			for (++i; i < c; ++i) {
				const match = lines[i].match(/^(\t+| +)/)
				if (match !== null) {
					return match[1]
				}
			}
		}
	}

	return undefined
}
