
import * as path from 'path'
import * as fs from 'mz/fs'

import {File} from './file'

/**
 * The project contains all the files
 */
export class Project {

  constructor(public basedir: string) {
  }

  async init() {
    await this.readDir('')
  }

  async readDir(dir: string) {
    var contents = await fs.readdir(path.join(this.basedir, dir))

    contents.sort()
    for (var pth of contents) {
      var fullpath = path.join(this.basedir, dir, pth)

      var stat = await fs.stat(fullpath)
      if (stat.isDirectory()) {
        this.readDir(path.join(dir, pth))
      } else if (stat.isFile()) {
        this.addFile(path.join(dir, pth))
      }
    }

  }

  async addFile(pth: string) {
    var f = await File.from(this.basedir, pth)
    console.log(pth, f.constructor.name, f.full_contents.length)
  }

  rebuild(changed_files: string[] = []) {

  }

}