
import * as pug from 'pug'
import * as nun from 'nunjucks'

export interface Data {

  kronk: {
    markdown_template?: string
    markdown_block?: string
    pug?: pug.Options,
    nunjucks?: nun.ConfigureOptions
  }

}

export const DEFAULTS: Data = {
  kronk: {
    markdown_template: 'markdown',
    markdown_block: 'markdown',
    pug: {

    },
    nunjucks: {

    }
  }
}