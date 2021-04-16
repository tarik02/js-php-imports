import * as Either from 'fp-ts/Either'

import { PhpImportsRc } from './PhpImportsRc'


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseRcFromObject = (source: any): PhpImportsRc => {
	const result = PhpImportsRc.decode(source)
	if (Either.isLeft(result)) {
		throw result.left
	}

	return result.right
}
