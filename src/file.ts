
import * as pth from 'path'

import {Data} from './data'

export abstract class File {

  static registerExtension(...exts: string[]): void {

  }

  base_data: Data = {kronk: {}}

  extension: string
  abspath: string
  name: string
  basename: string

  is_renderable: boolean = false

  constructor(
    public path: string,
    public basedir: string,
    public contents: string
  ) {
    var parsed = pth.parse(path)
    this.extension = parsed.ext
    this.basename = parsed.base
    this.abspath = pth.join(basedir, path)
    this.name = pth.join(parsed.dir, parsed.name)
  }

  /**
   * Fill
   */
  abstract parse(contents: string): void

  /**
   * Render the file to its final location.
   * @param data the data to be merged into this file's
   *    own data.
   * @returns The generated content
   */
  abstract render(data: Data): string

}


/**
 *
 */
export class MetaFile extends File {

  isRenderable() { return false }

  parse(contents: string) {

  }

  render(data: Data) { return '' }

}

import * as j5 from 'json5'

export class DataFile extends MetaFile {
  parse(contents: string) {
    // Add the { } necessary to JSON contents
    if (!/[\s]*/m.test(contents)) {
      contents = `{${contents}}`
    }
    this.base_data = j5.parse(contents)
  }
}

DataFile.registerExtension('json', 'json5')

export class YamlFile extends MetaFile {
  parse(contents: string) {

  }
}

YamlFile.registerExtension('yaml', 'yml')

export class TomlFile extends MetaFile {

}

TomlFile.registerExtension('toml', 'tml')


import * as nun from 'nunjucks'


export class NunjucksFile extends File {

  parse(contents: string) {
    nun.precompileString(contents, {

    })
  }

  render(data: Data) {
    return ''
  }

}

NunjucksFile.registerExtension('nks')