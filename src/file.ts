
import {Node} from './node'

export type FileGenerator = (() => string) | (() => Node)


export class File {

  static root: string

  constructor(public render: FileGenerator, public filename: string = '') {

  }

  /**
   * Take a guess at this file's output name from the original
   * module file.
   */
  guessNameFromModule(module: NodeModule) {
    const pth = module.filename
  }

}