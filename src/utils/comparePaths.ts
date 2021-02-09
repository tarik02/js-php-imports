import { Path } from '../types'


export default (a: Path, b: Path): number => {
	for (let i = 0, c = Math.min(a.length, b.length); i < c; ++i) {
		const diff = a[i].localeCompare(b[i])

		if (diff !== 0) {
			return diff
		}
	}

	return b.length - a.length
}
