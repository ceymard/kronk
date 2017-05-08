
import * as nun from 'nunjucks'

export interface Data {

  kronk: {
    draft?: boolean
    render?: boolean
    ignore_dir?: boolean
    markdown?: {
      template?: string
      block?: string
    }
    nunjucks?: {
      options?: nun.ConfigureOptions
    },
    output_name?: string
  }

}

export const DEFAULTS: Data = {
  kronk: {
    render: true,
    draft: false,
    ignore_dir: false,
    markdown: {
      template: 'markdown',
      block: 'markdown',
    },
    nunjucks: {
      options: {}
    }
  }
}