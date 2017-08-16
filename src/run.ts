import {Node} from './node'
import {File} from './file'
import * as path from 'path'
import * as col from 'colors'


export var basedir = process.env.KRONK_BASEDIR || path.dirname(require.main!.filename)
var base_re = new RegExp('^' + basedir + '/')

export var outdir = process.env.KRONK_OUTDIR || path.join(
  path.dirname(require.main!.filename),
  '../kronk-build'
)


/**
 * Render a file and optionnally write it to disk
 */
export function runFile(f: File, mod: NodeModule) {
  if (!f.filename) {
    // Remove the extension
    f.filename = (mod.filename.replace(/\.[^\.]+$/, '') + '.html').replace(base_re, '')
  }

  const res = f.render()
  if (res instanceof Node) {
    console.error(`${col.green.bold(' => ' + f.filename)} (${col.gray(mod.filename.replace(base_re, ''))})`)
    console.error(res.render('  '))
  }
}


function _foreach(v: any, fn: (a: any) => void) {
  if (!v) return
  if (Array.isArray(v)) v.forEach(v => fn(v))
  else
    fn(v)
}


const visited: {[file: string]: boolean} = {}

export function realRun(module: NodeModule | undefined) {
  if (!module || visited[module.filename]) return

  const xp = module.exports

  // FIXME should check here if the user meant to 
  // only render a specific file.

  if (xp instanceof File) runFile(xp, module)
  else {
    if (typeof xp.files === 'function') {
      _foreach(xp.files(), file => {
        if (file instanceof File) runFile(file, module)
      })
    }
  }

  visited[module.filename] = true

  _foreach(module.children, mod => {
    // FIXME maybe check for circular references ?
    realRun(mod)
    // console.log(mod.filename)
  })
}

export function run() {
  // Leave time for modules to be loaded...
  setTimeout(() => realRun(require.main), 10)
}