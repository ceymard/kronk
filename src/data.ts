
import * as nun from 'nunjucks'

export interface Data {

  kronk: {
    draft?: boolean
    render?: boolean
    ignore_dir?: boolean
    markdown: {
    }
    nunjucks: {
      options: nun.ConfigureOptions
      extends?: string
      block?: string
    },
    output_extension?: string

  }

}

export const DEFAULTS: Data = {
  kronk: {
    render: true,
    draft: false,
    ignore_dir: false,
    markdown: {
    },
    nunjucks: {
      options: {}
    }
  }
}