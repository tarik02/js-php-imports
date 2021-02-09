// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="grammar.d.ts" />

import { Document } from '.'
import * as parser from './grammar.peg'


export default (source: string): Document => parser.parse(source) as Document

