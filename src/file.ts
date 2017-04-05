
import * as fs from 'mz/fs'
import * as pth from 'path'

import {Data} from './data'

export abstract class File {

  public ext: string

  // The name of the file including its relative directory, without extension.
  public name: string

  public abspath: string

  /**
   * Most of the time, files have their own data.
   */
  public own_data: Data

  /**
   * The contents once decoded. Can stay null if the file is pure data
   * or javascript.
   */
  public original_contents: string | null = null
  public contents: string | null

  constructor(public basedir: string, public path: string, public full_contents: string, public base_data: Data) {
    var p = pth.parse(path)
    this.ext = p.ext
    this.name = pth.join(p.dir, p.base)
    this.abspath = pth.join(basedir, path)
  }

}

export abstract class Handler {

  static register(ext: string) {
    // ???
  }

  constructor(public file: File) {

  }

  abstract async handle(): Promise<any>
}
