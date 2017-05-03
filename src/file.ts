
import * as fs from 'mz/fs'
import * as pth from 'path'

import {Data} from './data'

export interface Handler {
  new (...a: any[]): File
}

export class File {

  public static handlers: {[ext: string]: Handler} = {}

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
    var ext = pth.extname(path).slice(1) // extension without the dotted part.
    if (this.handlers[ext]) {
      return new this.handlers[ext](basedir, path, contents)
    }
    return new File(basedir, path, contents)
  }

  constructor(public basedir: string, public path: string, public full_contents: string) {
    var p = pth.parse(path)
    this.ext = p.ext
    this.name = pth.join(p.dir, p.base)
    this.abspath = pth.join(basedir, path)
  }

  async readFile() {
    // Read the contents of the file
    this.full_contents = await fs.readFile(this.abspath, {encoding: 'utf-8'})
  }

  /**
   * Extract data from the file
   */
  async extractData() {
    // Not implemented by default.
  }

  /**
   * Handle the file and generate its contents (or any other contents)
   */
  async handle() {

  }

}

import './handlers'
