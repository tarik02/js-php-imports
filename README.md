# js-php-imports
[![Travis CI Build Status](https://travis-ci.com/Tarik02/js-php-imports.svg?branch=master)](https://travis-ci.com/Tarik02/js-php-imports)
[![npm version](https://badge.fury.io/js/php-imports.svg)](https://badge.fury.io/js/php-imports)

JavaScript library for formatting PHP imports.

## Installation

```bash
$ npm i --save php-imports
```
or
```bash
$ yarn add php-imports
```

## CLI

This package provides basic cli:
```
PHP imports formatter

USAGE
  $ php-imports [FILE]

OPTIONS
  -V, --verbose          Print more info
  -c, --config=config    JSON configuration
  -f, --flag=flag        Specify configuration key-value pair
  -h, --help             show CLI help
  -p, --project=project  [default: .] Project directory or .phpimportsrc file
  -v, --version          show CLI version
  --dry                  Don't write any changes to files
  --init                 Create .phpimportsrc file
```

By default, it uses .phpimportsrc file located at current working directory.

## phpimportsrc
It is a json file that contains configuration for this package. You can create this file with `$ php-imports --init`.

Also, you can specify these flags with `-f` argument:
`$ php-imports -f unused.enable=true`

It can contain the following options (dot means object nesting):
* `root`: Base location of sources. Default is `.` (current working directory).
* `include`: List of files to include (glob patterns) relatively to root (default is `src/**/*.php`).
* `exclude`: List of files to exclude (relatively to root, default is `node_modules` and `vendor`).
* `order`: Order of import sets and empty lines between them. An array of enums with possible values:
	- `emptyLine`
	- `all.all`
	- `all.class`
	- `all.function`
	- `all.const`
	- `singleUses.all`
	- `singleUses.class`
	- `singleUses.function`
	- `singleUses.const`
	- `groupedUses.all`
	- `groupedUses.class`
	- `groupedUses.function`
	- `groupedUses.const`
* `sort.order`: Order of first-level imports. Possible values: `default` (alphabetical) or `natural` (first longest, alphabetical).
* `sort.nestedOrder`: Order of second-level imports. Possible values: `default` (alphabetical) or `natural` (first longest, alphabetical).
* `print.emptyLinesAfterImports`: Count of empty lines between last import and the declaration after it.
* `print.wrap`: If false, then nested groups are never wrapped, if true (which is default), then they are always in separate lines.

	You can also set it to number to start wrapping only when line length exceeds that limit.

	Alternatively it can be set to object `{"all":false,"limit":120}` in order to put as much as possible imports in single line with wrapping still enabled.
* `psr12.enable`: Enable PSR-12 imports formatting.
* `psr12.isolateModifiers`: Whether to put different modifiers (without modifier, const and function) to different groups.
* `psr12.minNestedGroupNestedUsesCount`: Minimum count of nested uses to make a nested group with them.
* `psr12.minNestedGroupUsesCount`: Mimimum count of uses to make a nested group with them.
* `psr12.minGroupUsesCount`: Mimimum count of uses of same namespace to make a group with them.
* `custom.enable`: Enable custom imports formatting.
* `custom.isolateModifiers`: Whether to put different modifiers (without modifier, const and function) to different groups.
* `custom.include`: A list of namespaces that should always be grouped. Can be used with wildcards (*) and double wildcards (**).
* `custom.exclude`: A list of namespaces that should never be grouped.
* `unused.enable`: Clean up unused imports.

## License

The project is released under the MIT license. Read the [license](https://github.com/Tarik02/js-php-imports/blob/master/LICENSE) for more information.
