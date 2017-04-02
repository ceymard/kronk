
import * as pug from 'pug'
import * as c from 'colors'

import {Data} from './data'

export class File {

  constructor(public path: string) {

  }

  getMeta(): Promise<any> {
    return null
  }

  parse() {

  }

  /**
   * Render the file to its final location.
   * @param to the final path
   */
  render(to: string, data: Data) {

  }

}