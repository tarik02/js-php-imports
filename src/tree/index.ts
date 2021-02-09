import debugPrint from './debugPrint'
import executePattern from './executePattern'
import flatten from './flatten'
import fromFlat from './fromFlat'
import getBaseForPattern from './getBaseForPattern'
import getRestForPattern from './getRestForPattern'
import matchPattern from './matchPattern'
import removeNode from './removeNode'


export * from './types'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Tree = {
	debugPrint,
	executePattern,
	flatten,
	fromFlat,
	getBaseForPattern,
	getRestForPattern,
	matchPattern,
	removeNode,
}
