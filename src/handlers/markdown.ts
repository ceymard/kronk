
import {parseData} from '../helpers'
import {File} from '../file'
import {Data} from '../data'

var re_md_data = /^(?:\s|\r|\n)*<!-+-(((?!-->).|\r|\n)*)-+->/mg

import {renderNunjucks} from './nunjucks'

export async function parseMarkdown(file: File) {
  if (!file.is('md')) return

  var ct = file.original_contents
  var match = re_md_data.exec(ct)

  if (match && match.index === 0) {
    // console.log(match)
    ct = ct.replace(match[0], '')
    file.own_data = parseData(match[1])
  }

  file.contents = ct
}

File.parsers.push(parseMarkdown)


export async function markdownRenderer(file: File, data: Data) {

  if (!file.is('md')) return
  file.rendered = await renderNunjucks(file, data)

}

File.renderers.push(markdownRenderer)