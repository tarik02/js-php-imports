import { Path } from '..'


export default (a: Path, b: Path): number => {
	if (a.length !== b.length) {
		return b.length - a.length
	}

	for (let i = 0, c = a.length; i < c; ++i) {
		const diff = a[i].localeCompare(b[i])

		if (diff !== 0) {
			return diff
		}
	}

	return 0
}
