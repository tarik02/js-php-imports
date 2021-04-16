import * as Either from 'fp-ts/Either'

import { PhpImportsConfig } from './PhpImportsConfig'
import { PhpImportsRc } from './PhpImportsRc'


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseConfigFromObject = (source: any): PhpImportsConfig => {
	const result = PhpImportsConfig.decode(source)
	if (Either.isLeft(result)) {
		throw result.left
	}

	return result.right
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseRcFromObject = (source: any): PhpImportsRc => {
	const result = PhpImportsRc.decode(source)
	if (Either.isLeft(result)) {
		throw result.left
	}

	return result.right
}
