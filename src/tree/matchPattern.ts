import { Path } from '../types'


export default (pattern: Path, example: Path): boolean => (
	pattern.length === example.length && pattern.every((patternItem, i) => (
		patternItem === '*' || patternItem === example[i]
	))
)
