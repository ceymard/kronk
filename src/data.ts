
import * as nun from 'nunjucks'

export interface Data {

  kronk: {
    draft?: boolean
    render?: boolean
    markdown?: {
      template?: string
      block?: string
    }
    nunjucks?: {
      options?: nun.ConfigureOptions
    }
  }

}

export const DEFAULTS: Data = {
  kronk: {
    render: true,
    draft: false,
    markdown: {
      template: 'markdown',
      block: 'markdown',
    },
    nunjucks: {
      options: {}
    }
  }
}