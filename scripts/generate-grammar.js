/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs')
const path = require('path')
const pegjs = require('pegjs')


const SOURCE_FILE = path.join(__dirname, '../src/grammar/grammar.peg')
const DEST_FILE = path.join(__dirname, '../src/grammar/grammar.js')

if (!fs.existsSync(DEST_FILE) || fs.statSync(SOURCE_FILE).mtime > fs.statSync(DEST_FILE).mtime) {
	const parserSource = pegjs.generate(fs.readFileSync(SOURCE_FILE, 'utf-8'), {
		output: 'source',
		format: 'commonjs',
	})

	fs.writeFileSync(DEST_FILE, '/* eslint-disable */\n' + parserSource)
}
