
import {Data} from './data'

export class File {

  constructor(public path: string, public contents: string, public data: Data) { }

  /**
   * Render the file to its final location.
   * @param to the final path
   */
  render(to: string) {
    // TODO: track rendered files from this file ?
  }

}