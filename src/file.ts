
import * as fs from 'mz/fs'
import * as pth from 'path'
import * as deep from 'deep-extend'

import {Data} from './data'
import {Project} from './project'


export type Parser = (file: File) => Promise<any>
export type Renderer = (file: File, data: Data) => Promise<any>


export class File {

  public static parsers: Parser[] = []
  public static renderers: Renderer[] = []

  public ext: string
  // The name of the file including its relative directory, without extension.
  public name: string
  public abspath: string
  public basename: string
  public dir: string

  /**
   * Most of the time, files have their own data.
   */
  public data: Data
  /**
   * This is filled by the project once all the files have been read
   * and is used to track which files will receive this file's data.
   */
  public children: File[] = []

  public contents: string
  public rendered: string | null = null


  /**
   * The contents once decoded. Can stay null if the file is pure data
   * or javascript.
   */

  private _string_contents: string | null = null
  /**
   * An accessor that will read the contents of a file
   */
  public get original_contents() {
    if (this._string_contents === null)
      this._string_contents = fs.readFileSync(this.abspath, {encoding: 'utf-8'})
    return this._string_contents
  }

  static from(basedir: string, path: string, project: Project): File {
    return new File(basedir, path, project)
  }

  constructor(public basedir: string, public path: string, public project: Project) {
    var p = pth.parse(path)
    this.ext = p.ext.slice(1)
    this.basename = p.base.replace(/\..*?$/, '')
    this.name = this.basename === '__data__' ? p.dir : pth.join(p.dir, p.base)
    this.dir = p.dir
    this.abspath = pth.join(basedir, path)
  }

  isChild(file: File) {
    if (this.name.indexOf(file.name) === 0) return true
    return false
  }

  addChild(file: File) {
    // The file should be appended to a child if it is a descendent of it.
    for (var c of this.children) {
      if (file.isChild(c)) {
        c.addChild(file)
        return
      }
    }

    this.children.push(file)
    this.children.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
  }

  /**
   * Checks if the file is of a given extension
   * @param exts the extensions to check for
   */
  is(...exts: string[]): boolean {
    for (var e of exts)
      if (e === this.ext) return true
    return false
  }

  /**
   * A file may not be rendered to the build directory if it was marked
   * as kronk.render = false or if it is a draft (kronk.draft = true)
   * or if it contains an underscore at the beginning or at the end
   * of the file name.
   */
  isRenderable(data: Data): boolean {
    return data.kronk.render !== false && data.kronk.draft !== true &&
      this.basename[0] !== '_' && this.basename[this.basename.length - 1] !== '_'
  }

  /**
   * Extract data from the file
   * @param data The data defined in files above us.
   */
  async parse() {
    // We reset the string contents. For all we know, the file may have changed
    // on the disk.
    this._string_contents = null

    // Extract the contents and the data. After this phase, this.own_data is set.
    for (var parser of File.parsers) {
      await parser(this)
    }

  }

  /**
   * This method is called once the project knows all the data and
   * has merged it into its respective files. It is thus possible
   * to use File#data in the rendering engines.
   */
  async render(data: Data) {
    await this.parse()
    var complete_data = deep({}, data, this.data)

    if (this.isRenderable(complete_data)) {
      try {
        for (var renderer of File.renderers) {
          await renderer(this, complete_data)
        }
        console.log(`* rendered ${this.name}`)
      } catch (e) {
        console.error(`!! ${this.name} - ${e.message}`)
      }
    }

    for (var c of this.children) {
      c.render(complete_data)
    }
  }

  /**
   * Once the file has been rendered, write its output into the destination.
   */
  async write() {

  }

}


export interface Handler {

  handle(file: File): Promise<any>

}


import './handlers'
