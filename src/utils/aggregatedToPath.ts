import { Path } from '..'


export default (aggregated: string): Path => (
	(
		aggregated[0] === '\\'
			? aggregated.substring(1)
			: aggregated
	).split('\\')
)
