import * as Either from 'fp-ts/Either'
import { Errors } from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'

import { PhpImportsConfig } from './PhpImportsConfig'
import { PhpImportsRc } from './PhpImportsRc'


export class ConfigParsingError extends Error {
	errors: Errors
	source: any

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	constructor(errors: Errors, source: any) {
		super(`${formatValidationErrors(errors)}\nConfig:\n${JSON.stringify(source, undefined, '  ')}`)

		this.errors = errors
		this.source = source
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseConfigFromObject = (source: any): PhpImportsConfig => {
	const result = PhpImportsConfig.decode(source)
	if (Either.isLeft(result)) {
		throw new ConfigParsingError(result.left, source)
	}

	return result.right
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseRcFromObject = (source: any): PhpImportsRc => {
	const result = PhpImportsRc.decode(source)
	if (Either.isLeft(result)) {
		throw new ConfigParsingError(result.left, source)
	}

	return result.right
}
