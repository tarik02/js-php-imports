declare module '*.peg' {
	import { Parser } from 'pegjs'


	const parser: Parser
	export = parser;
}
