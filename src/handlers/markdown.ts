
import {parseData} from '../helpers'
import {File} from '../file'
import {Data} from '../data'
import * as deep from 'deep-extend'

import * as hljs from 'highlight.js'
import * as md from 'markdown-it'

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

  file.contents = ct // markdown.render(ct)
}

File.parsers.push(parseMarkdown)


export async function markdownRenderer(file: File, data: Data) {

  if (!file.is('md')) return

  var opts = deep({
    html: true,
    highlight: function (str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {

        try {
          return hljs.highlight(lang, str).value;
        } catch (__) { console.error(__)}
      }
    return ''; // use external default escaping
  }

  }, data.kronk.markdown)

  var markdown = md(opts)
  file.contents = markdown.render(file.contents)
  file.rendered = await renderNunjucks(file, data)
}

File.renderers.push(markdownRenderer)