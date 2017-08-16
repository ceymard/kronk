
import {Node} from './node'

export type FileGenerator = (() => string) | (() => Node)


export class File {

  static root: string

  constructor(public render: FileGenerator, public filename: string = '') {

  }

}