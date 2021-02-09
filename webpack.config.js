// @ts-check

'use strict'

const path = require('path')
const webpack = require('webpack')

/** @type {webpack.Configuration} */
const config = {
	target: 'node',
	devtool: 'source-map',
	mode: 'none',

	entry: {
		'index': './src/index.ts',
	},

	output: {
		path: path.resolve(__dirname, 'lib'),
		filename: '[name].js',
		library: 'php-imports',
		libraryTarget: 'umd',
	},

	resolve: {
		extensions: ['.ts', '.js'],
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
			{
				test: /\.peg$/,
				use: [
					{
						loader: 'pegjs-loader',
					},
				],
			},
		],
	},
}

module.exports = config
