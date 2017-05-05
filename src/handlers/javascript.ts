
import {File} from '../file'
// import {Data} from '../data'

import * as ne from 'node-eval'

/**
 * Require a javascript file and set this file's data as its
 * exports object.
 *
 * @param file
 */
export async function javascriptParser(file: File) {
  if (!file.is('js')) return

  // Maybe we should give a context here ?
  ne(file.contents, file.abspath, {})
  // Or should
}

File.parsers.push(javascriptParser)


export async function javascriptHandler(file: File) {

  if (!file.is('js')) return

  // await file.own_data.handle(file)
}
