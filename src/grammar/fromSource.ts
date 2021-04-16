import { Document } from '.'
import { parse } from './grammar'


export default (source: string): Document => parse(source) as Document
