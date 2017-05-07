
import {File} from '../file'
import {Data} from '../data'
import {Prom} from '../helpers'
import {Project} from '../project'

import * as toml from 'toml'
import * as nj from 'nunjucks'

var re_nks_data = /^(?:\s|\n)*\{#(((?!#\}).|\n)*)#\}(\n|\s)*/mi

var KronkLoader = nj.Loader.extend({

  async: true,

  init(project: Project) {
    this.project = project
  },

  async getSource(name: string, done: (err: any, res: any) => any) {
    var file = this.project.files_by_name[name + '.nks']
    if (!file) throw new Error(`nunjucks: can't extend ${name}`)

    if (file.contents == null)
      await file.parse()

    done(null, {
      src: file.contents,
      path: name,
      noCache: true // we do the caching ourselves.
    })
  }
} as any)


export async function nunjucksParser(file: File) {

  if (!file.is('nks')) return

  var ct = file.original_contents
  var match = re_nks_data.exec(ct)

  if (match) {
    file.contents = ct.replace(match[0], '')
    file.data = toml.parse(match[1])
  } else {
    file.contents = ct
  }

}

File.parsers.push(nunjucksParser)


async function nunjucksRenderer(file: File, data: Data) {

  // Fixme: check for kronk.nunjuck
  if (!file.is('nks')) return

  var env = new nj.Environment(new KronkLoader(file.project))
  var p = new Prom<string>()

  env.renderString(file.contents, file.data, p.callback())
  file.rendered = await p.promise

}

File.renderers.push(nunjucksRenderer)

