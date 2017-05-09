
import {File} from '../file'
import * as tsapi from 'typescript.api'
import {Prom} from '../helpers'
import {Data} from '../data'

import * as ne from 'node-eval'


var exports_symbol = Symbol('exports')

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
  var module = {exports: {} as any}
  ne(contents, file.abspath, {console, module, exports: module.exports})

  var fileany = file as any
  var exports = module.exports
  // back up the exports into a non-enumerable symbol property.
  fileany[exports_symbol] = exports

  if (typeof exports.data === 'function') {
    file.own_data = await exports.data()
  }
}

File.parsers.push(javascriptParser)


export async function javascriptHandler(file: File, data: Data) {

  if (!file.is('js', 'ts')) return

  var fileeany = file as any
  var exports = fileeany[exports_symbol] || {} as any

  if (typeof exports.render === 'function') {
    await exports.render(data)
  }
1  // await file.own_data.handle(file)
}
