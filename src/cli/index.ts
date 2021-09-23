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

		dry: Flags.boolean({
			description: 'Don\'t write any changes to files',
		}),

		init: Flags.boolean({
			description: 'Create .phpimportsrc file',
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

		flag: Flags.string({
			char: 'f',
			description: 'Specify configuration key-value pair',
			multiple: true,
		}),
	}

	static args = [
		{
			name: 'file',
			multiple: true,
		},
	]

	static strict = false

	private applyFlagsToObject(config: any, flags: Record<string, string>): any {
		for (const [key, value] of Object.entries(flags)) {
			const path = key.split('.')

			let currentObject = config
			for (const pathItem of path.slice(0, -1)) {
				if (pathItem in currentObject) {
					currentObject = currentObject[pathItem]
				} else {
					currentObject = currentObject[pathItem] = {}
				}
			}

			currentObject[path.slice(-1)[0]] = value
		}

		return config
	}

	async loadConfig(
		configPath: string | undefined,
		configContents: string | undefined,
		overrideFlags: Record<string, string> = {},
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
				if ((e as any).code === 'ENOENT') {
					return {
						root: path.dirname(rcFile),
						config: parseRcFromObject(this.applyFlagsToObject({}, overrideFlags)),
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

		const config = parseRcFromObject(this.applyFlagsToObject(configObject, overrideFlags))

		return {
			root: path.resolve(path.dirname(rcFile), config.root),
			config,
		}
	}

	async initProject(): Promise<void> {
		const rcFile = path.resolve(process.cwd(), '.phpimportsrc')

		try {
			await fs.stat(rcFile)

			this.error(`Path '${rcFile}' already exists`)
		} catch (e) {
			if ((e as any).code !== 'ENOENT') {
				this.error(e as any)
			}
		}

		await fs.writeFile(
			rcFile,
			JSON.stringify(
				PhpImportsRc.encode(parseRcFromObject({})),
				undefined,
				4,
			),
		)

		this.log(`File '${rcFile}' successfully created`)
	}

	async run(): Promise<void> {
		const { args, flags } = this.parse(PhpImportsCli)
		const { verbose, dry } = flags

		if (flags.init) {
			return await this.initProject()
		}

		const overrideFlags: Record<string, string> = {}

		for (const flag of flags.flag ?? []) {
			const [key, value] = [...flag.split('=', 2), 'true']
			overrideFlags[key] = value
		}

		const { root, config } = await this.loadConfig(
			flags.project,
			flags.config,
			overrideFlags,
		)

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
		const warnings: Array<{ description: string, error: Error | string | undefined }> = []

		let pendingLogs: Array<() => void> = []
		const flushLogs = () => {
			const currentPendingLogs = pendingLogs
			pendingLogs = []

			for (const callback of currentPendingLogs) {
				progressBar.terminal.cursorTo(0, null)
				progressBar.terminal.clearRight()
				callback()
			}
		}

		progressBar.on('redraw-pre', flushLogs)
		progressBar.on('stop', flushLogs)

		try {
			await PromisePool
				.withConcurrency(8)
				.for(paths)
				.process(async filePath => {
					try {
						const contents = await fs.readFile(filePath, { encoding: 'utf-8' })

						const change = processText(contents, config, undefined, {
							onWarning(description, error) {
								warnings.push({
									description: `in file ${filePath}: ${description}`,
									error,
								})
							},
						})

						if (change !== undefined) {
							const newContents = [
								contents.substring(0, change.start),
								change.replacement,
								contents.substring(change.end),
							].join('')

							if (verbose) {
								pendingLogs.push(
									() => this.log(`writing file ${path.relative(root, filePath)}`),
								)
							}

							if (! dry) {
								await fs.writeFile(filePath, newContents)
							}

							++changedFilesCount
						}
					} catch (error) {
						warnings.push({
							description: `in file ${filePath}`,
							error: error as any,
						})
					} finally {
						progressBar.increment()
					}
				})
		} finally {
			progressBar.stop()
		}

		this.log(`processed ${paths.length}, ${changedFilesCount} were changed`)

		if (warnings.length > 0) {
			this.warn(`${warnings.length} warnings occurred:`)
			for (const warning of warnings) {
				if (warning.error) {
					this.error(warning.description, { exit: false })
					this.error(warning.error, { exit: false })
				} else {
					this.warn(warning.description)
				}
			}
		}
	}
}

export const run = PhpImportsCli.run.bind(PhpImportsCli)
