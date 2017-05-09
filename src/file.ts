
import * as fs from 'mz/fs'
import * as pth from 'path'
import * as deep from 'deep-extend'
import * as mk from 'mkdirp2'

import {Data, DEFAULTS} from './data'
import {Project} from './project'


export type Parser = (file: File) => Promise<any>
export type Renderer = (file: File, data: Data) => Promise<any>


export class File {

  public static parsers: Parser[] = []
  public static renderers: Renderer[] = []

  public parsed = false
  public ext: string
  // The name of the file including its relative directory, without extension.
  public name: string
  public abspath: string
  public basename: string
  public dir: string

  /**
   * Most of the time, files have their own data.
   */
  public own_data: Data = {} as any
  public data: Data | null = null

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
    this.name = pth.join(p.dir, p.base)
    this.dir = p.dir
    this.abspath = pth.join(basedir, path)
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

    this.parsed = true
  }

  async getData(): Promise<Data> {
    var data = deep({}, DEFAULTS)

    for (var f of this.project.data_files) {

      if (pth.relative(f.dir, this.dir).indexOf('..') !== 0) {
        if (!f.parsed) await f.parse()
        data = deep(data, f.own_data)
        this.project.deps.add(this, f)
      }

    }

    return data
  }

  /**
   * This method is called once the project knows all the data and
   * has merged it into its respective files. It is thus possible
   * to use File#data in the rendering engines.
   */
  async render() {
    // console.log(`---> ${this.name}`)
    var data = await this.getData()


    if (this.isRenderable(data) && data.kronk.render) {
      await this.parse()
      data = deep(data, this.own_data)

      // No rendering of this file after parsing.
      if (!data.kronk.render) return

      try {
        for (var renderer of File.renderers) {
          await renderer(this, data)
        }
      } catch (e) {
        console.error(`!! ${this.name} - ${e.message}`)
      }
    }

    if (this.rendered != null) {
      this.write(data)
    }

  }

  change() {
    this.parsed = false
    this.own_data = {} as Data
  }

  /**
   * Once the file has been rendered, write its output into the destination.
   */
  async write(data: Data) {
    // get the rendered portion
    // FIXME this should change !!
    var output = pth.join(
      this.project.dir_build,
      data.kronk.output_name || this.name.replace(/(md|nks)$/, 'html')
    )

    var dirname = pth.dirname(output)
    await mk.promise(dirname)
    await fs.writeFile(output, this.rendered!)
    console.log('=>', output.replace(this.project.dir_build + '/', ''))
  }

}


export interface Handler {

  handle(file: File): Promise<any>

}

import './handlers'
