import { GroupUse, GroupedUses, SingleUse } from '../group'

import { PrintConfig } from '.'


const CONFIG_DEFAULTS: PrintConfig = {
	indent: ' '.repeat(4),
	order: [
		'singleUses.all',
		'emptyLine',
		'groupedUses.all',
	],
}

export default (
	grouped: GroupedUses,
	config: Partial<PrintConfig> = {},
): string => {
	const {
		indent,
		order,
	} = { ...CONFIG_DEFAULTS, ...config }

	const printSingleUse = (use: SingleUse): string => (
		`use${use.modifier ? ` ${use.modifier}` : ''} ${use.path.join('\\')}${use.alias ? ` as ${use.alias}` : ''};`
	)

	const printGroupUse = (use: GroupUse): string => [
		`use${use.modifier ? ` ${use.modifier}` : ''} ${use.path.join('\\')}\\{`,
		...use.items.map((it, i) => (
			`${indent}${it.modifier ? `${it.modifier} ` : ''}${it.path.join('\\')}${it.alias ? ` as ${it.alias}` : ''}${i === use.items.length - 1 ? '' : ','}`
		)),
		'};',
	].join('\n')

	const parts = []

	for (const item of order) {
		switch (item) {
		case 'emptyLine':
			parts.push('')
			break

		case 'singleUses.all':
			parts.push(
				grouped.items
					.filter((it): it is SingleUse => it.type === 'single')
					.map(it => printSingleUse(it))
					.join('\n'),
			)
			break

		case 'singleUses.class':
			parts.push(
				grouped.items
					.filter((it): it is SingleUse => it.type === 'single')
					.filter(it => it.modifier === null)
					.map(it => printSingleUse(it))
					.join('\n'),
			)
			break

		case 'singleUses.function':
			parts.push(
				grouped.items
					.filter((it): it is SingleUse => it.type === 'single')
					.filter(it => it.modifier === 'function')
					.map(it => printSingleUse(it))
					.join('\n'),
			)
			break

		case 'singleUses.const':
			parts.push(
				grouped.items
					.filter((it): it is SingleUse => it.type === 'single')
					.filter(it => it.modifier === 'const')
					.map(it => printSingleUse(it))
					.join('\n'),
			)
			break

		case 'groupedUses.all':
			parts.push(
				grouped.items
					.filter((it): it is GroupUse => it.type === 'group')
					.map(it => printGroupUse(it))
					.join('\n'),
			)
			break

		case 'groupedUses.class':
			parts.push(
				grouped.items
					.filter((it): it is GroupUse => it.type === 'group')
					.filter(it => it.modifier === null)
					.map(it => ({
						...it,
						items: it.items.filter(item => item.modifier === null),
					}))
					.filter(it => it.items.length !== 0)
					.map(it => printGroupUse(it))
					.join('\n'),
			)
			break

		case 'groupedUses.function':
			parts.push(
				grouped.items
					.filter((it): it is GroupUse => it.type === 'group')
					.map(it => ({
						...it,
						items: it.items.filter(item => (
							item.modifier === 'function' ||
								(item.modifier === null && it.modifier === 'function')
						)),
					}))
					.filter(it => it.items.length !== 0)
					.map(it => printGroupUse(it))
					.join('\n'),
			)
			break

		case 'groupedUses.const':
			parts.push(
				grouped.items
					.filter((it): it is GroupUse => it.type === 'group')
					.map(it => ({
						...it,
						items: it.items.filter(item => (
							item.modifier === 'const' ||
								(item.modifier === null && it.modifier === 'const')
						)),
					}))
					.filter(it => it.items.length !== 0)
					.map(it => printGroupUse(it))
					.join('\n'),
			)
			break
		}
	}

	const resultParts = []

	for (const part of parts) {
		if (part === '') {
			if (resultParts.length === 0 || resultParts[resultParts.length - 1] === '') {
				continue
			}
		}

		resultParts.push(part)
	}

	while (resultParts.length && resultParts[resultParts.length - 1] === '') {
		resultParts.pop()
	}

	return resultParts.join('\n')
}
