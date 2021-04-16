import { Command, flags as Flags } from '@oclif/command'
import PromisePool = require('@supercharge/promise-pool')
import { cli } from 'cli-ux'
import { promises as fs } from 'fs'
import * as globby from 'globby'
import * as path from 'path'

import { processText } from '..'
import { parseRcFromObject } from '../io'
import { PhpImportsRc } from '../io/PhpImportsRc'


export class PhpImportsCli extends Command {
	static description = 'PHP imports formatter'

	static flags = {
		version: Flags.version({ char: 'v' }),
		help: Flags.help({ char: 'h' }),

		verbose: Flags.boolean({
			char: 'V',
			description: 'Print more info',
		}),

		project: Flags.string({
			char: 'p',
			description: 'Project directory or .phpimportsrc file',
			default: '.',
		}),

		config: Flags.string({
			char: 'c',
			description: 'JSON configuration',
		}),
	}

	static args = [
		{
			name: 'file',
			multiple: true,
		},
	]

	static strict = false

	async loadConfig(
		configPath: string | undefined,
		configContents: string | undefined,
	): Promise<{ root: string, config: PhpImportsRc }> {
		const configPathResolved = path.resolve(process.cwd(), configPath ?? '.')
		const configStat = await fs.stat(configPathResolved)

		if (!configStat.isFile() && !configStat.isDirectory()) {
			this.error(`Path '${configPathResolved}' is neither a directory nor a file`, {
				exit: 1,
			})
		}

		const rcFile = configStat.isDirectory()
			? path.join(configPathResolved, '.phpimportsrc')
			: configPathResolved

		if (configContents === undefined) {
			try {
				if (!(await fs.stat(rcFile)).isFile()) {
					throw new Error(`${rcFile} exists, but it is not a file`)
				}
			} catch (e) {
				if (e.code === 'ENOENT') {
					return {
						root: path.dirname(rcFile),
						config: parseRcFromObject({}),
					}
				}

				throw e
			}

			configContents = (await fs.readFile(rcFile, { encoding: 'utf-8' })).trim()
		}

		const configObject = (configContents === ''
			? {}
			: JSON.parse(configContents)
		)

		const config = parseRcFromObject(configObject)

		return {
			root: path.resolve(path.dirname(rcFile), configObject.root),
			config,
		}
	}

	async run(): Promise<void> {
		const { args, flags } = this.parse(PhpImportsCli)
		const { verbose } = flags

		const { root, config } = await this.loadConfig(flags.project, flags.config)

		const paths = await globby(
			(args.file !== undefined
				? [args.file]
				: config.include
			),
			{
				cwd: root,
				absolute: true,
				onlyFiles: true,
				unique: true,
				ignore: [...config.exclude],
			},
		)

		const progressBar = cli.progress()
		progressBar.start(paths.length)

		let changedFilesCount = 0

		try {
			await PromisePool
				.withConcurrency(8)
				.for(paths)
				.process(async filePath => {
					const contents = await fs.readFile(filePath, { encoding: 'utf-8' })

					const change = processText(contents, config)

					if (change !== undefined) {
						const newContents = [
							contents.substring(0, change.start),
							change.replacement,
							contents.substring(change.end),
						].join('')

						if (verbose) {
							console.log(`writing file ${path.relative(root, filePath)}`)
						}

						await fs.writeFile(filePath, newContents)

						++changedFilesCount
					}

					progressBar.increment()
				})
		} finally {
			progressBar.stop()
		}

		console.log(`processed ${paths.length}, ${changedFilesCount} were changed`)
	}
}

export const run = PhpImportsCli.run.bind(PhpImportsCli)
