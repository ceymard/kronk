
import {File} from '../file'
import {Data} from '../data'
import {Prom, parseData} from '../helpers'
import {Project} from '../project'

import * as nj from 'nunjucks'

var re_nks_data = /^(?:\s|\r|\n)*\{#-?(((?!#\}).|\r|\n)*)-?#\}(\n|\r|\s)*/mi


export class KronkLoader extends nj.Loader {
  async = true

  constructor(public project: Project, public file: File) {
    super()
  }

  async getSource(name: string, done: (err: any, res?: any) => any) {
    if (name.indexOf(this.project.basedir) === 0) name = name.replace(this.project.basedir + '/', '')
    var complete = name + '.nks'
    var file = this.project.files_by_name[complete]
    if (!file) {
      return done(new Error(`nunjucks: can't extend ${complete}`))
    }

    this.project.deps.add(file, this.file)

    if (file.parsed == null || file.contents == null)
      await file.parse()

    done(null, {
      src: file.contents,
      path: name,
      noCache: true // we do the caching ourselves.
    })
  }
}


export async function nunjucksParser(file: File) {

  if (!file.is('nks')) return

  var ct = file.original_contents
  var match = re_nks_data.exec(ct)

  if (match && match.index === 0) {
    file.contents = ct.replace(match[0], '')
    file.own_data = parseData(match[1])
  } else {
    file.contents = ct
  }

}

File.parsers.push(nunjucksParser)


export async function renderNunjucks(file: File, data: Data) {
  var env = new nj.Environment(new KronkLoader(file.project, file) as any)
  var p = new Prom<string>()

  var contents = file.contents

  if (data.kronk.nunjucks.block) {
    contents = `{% block ${data.kronk.nunjucks.block} -%}
${contents}
{%- endblock %}`
  }

  if (data.kronk.nunjucks.extends) {
    contents = `{% extends '${data.kronk.nunjucks.extends}' %}\n${contents}`
  }

  env.renderString(contents, data, p.callback())
  return p.promise
}

async function nunjucksRenderer(file: File, data: Data) {

  // Fixme: check for kronk.nunjuck
  if (!file.is('nks')) return

  file.rendered = await renderNunjucks(file, data)

}

File.renderers.push(nunjucksRenderer)
