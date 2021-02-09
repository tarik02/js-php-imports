import { Path } from '../types'


export default (pattern: Path, example: Path): Path => {
	if (pattern[pattern.length - 1] === '**') {
		pattern = pattern.slice(0, -1)
	}

	return example.slice(0, pattern.length)
}
