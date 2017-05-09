
import {File} from '../file'
import * as tsapi from 'typescript.api'
import {Prom} from '../helpers'

import * as ne from 'node-eval'


/**
 * Require a javascript file and set this file's data as its
 * exports object.
 *
 * @param file
 */
export async function javascriptParser(file: File) {
  if (!file.is('js', 'ts')) return

  var contents = file.original_contents

  if (file.is('ts')) {
    // tsapi.reset() !!!
    var unit = tsapi.create(file.name, contents)
    var p = new Prom<any>(false)
    tsapi.compile([unit], p.callback())

    var result = await p.promise
    contents = result[0].content
    // return
  }

  file.contents = contents

  // We will never render a .js file that got here.
  // file.own_data.kronk.render = false

  // Maybe we should give a context here ?
  var module = {exports: {}}
  var exports = module.exports
  ne(contents, file.abspath, {console, module, exports})
  console.log(module)

  // Or should
}

File.parsers.push(javascriptParser)


export async function javascriptHandler(file: File) {

  if (!file.is('js')) return

  // await file.own_data.handle(file)
}
