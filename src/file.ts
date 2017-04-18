
import * as fs from 'mz/fs'
import * as pth from 'path'

import {Data} from './data'

export class File {

  public ext: string

  // The name of the file including its relative directory, without extension.
  public name: string

  public abspath: string

  /**
   * Most of the time, files have their own data.
   */
  public own_data: Data
  public data: Data

  /**
   * The contents once decoded. Can stay null if the file is pure data
   * or javascript.
   */
  public original_contents: string | null = null
  public contents: string | null

  static async from(basedir: string, path: string): Promise<File> {
    var contents = await fs.readFile(pth.join(basedir, path), {encoding: 'utf-8'})
    var file = new File(basedir, path, contents)
    return file
  }

  constructor(public basedir: string, public path: string, public full_contents: string) {
    var p = pth.parse(path)
    this.ext = p.ext
    this.name = pth.join(p.dir, p.base)
    this.abspath = pth.join(basedir, path)
  }

}

export abstract class Handler {

  static handlers: {[ext: string]: (new () => Handler)[] | undefined} = {}

  static register<T extends Handler>(this: new () => T, ext: string) {
    var handlers = Handler.handlers[ext]

    if (!handlers) {
      Handler.handlers[ext] = handlers = []
    }

    handlers.push(this)
  }

  static handleFile(file: File) {
    if (!Handler.handlers[file.ext])
      throw new Error(`no handlers for ${file.name}`)
  }

  //////////////////////////////////////////////

  require: (new() => Handler)[]

  constructor(public file: File) {

  }

  abstract async handle(): Promise<any>
}
