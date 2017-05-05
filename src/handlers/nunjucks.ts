
import {File} from '../file'
import {Data} from '../data'
import {Project} from '../project'
import * as toml from 'toml'
import * as nj from 'nunjucks'

var re_nks_data = /^(?:\s|\n)*\{#(((?!#\}).|\n)*)#\}(\n|\s)*/mi

export class KronkLoader {

  constructor(public project: Project) {

  }

  // I should track whenever a template change ??

  getSource(name: string) {
    var file = this.project.files_by_name[name]
    if (!file) throw new Error(`nunjucks: can't extend ${name}`)

    return {
      src: file.contents,
      path: name,
      noCache: true // we do the caching ourselves.
    }
  }
}


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
  var result = env.renderString(file.contents, file.data)
  file.rendered = result
}

File.renderers.push(nunjucksRenderer)

