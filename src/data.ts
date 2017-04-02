
import * as pug from 'pug'
import * as nun from 'nunjucks'

export interface Data {

  kronk: {
    markdown_template: string
    markdown_block: string
    pug_options?: pug.Options,
    nunjucks_options?: nun.ConfigureOptions
  }

}

export const DEFAULTS: Data = {
  kronk: {
    markdown_template: 'markdown',
    markdown_block: 'markdown',
    pug_options: {

    },
    nunjucks_options: {

    }
  }
}