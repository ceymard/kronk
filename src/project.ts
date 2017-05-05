
import * as path from 'path'
import * as fs from 'mz/fs'

import {File} from './file'
import {DEFAULTS, Data} from './data'

/**
 * The project contains all the files
 */
export class Project {

  files_by_name: {[name: string]: File} = {}
  root = new File(this.basedir, '__root__', this)

  constructor(public basedir: string) {
    this.root.data = DEFAULTS
  }

  async init() {
    await this.readDir('')
  }

  async readDir(dir: string) {
    var contents = await fs.readdir(path.join(this.basedir, dir))
    var promises: Promise<any>[] = []

    for (var pth of contents) {
      var fullpath = path.join(this.basedir, dir, pth)

      var stat = await fs.stat(fullpath)
      if (stat.isDirectory()) {
        promises.push(this.readDir(path.join(dir, pth)))
      } else if (stat.isFile()) {
        this.addFile(path.join(dir, pth))
      }
    }

    await Promise.all(promises)

  }

  addFile(pth: string) {
    var f = File.from(this.basedir, pth, this)
    this.files_by_name[pth] = f
    this.root.addChild(f)
  }

  removeFile(pth: string) {

  }

  rebuild(changed_files: string[] = []) {
    this.root.render({} as Data)
  }

  showTree(file = this.root, indent = 0) {
    for (var i = 0; i < indent; i++) process.stdout.write(' ')
    console.log(file.name)
    for (var c of file.children) {
      this.showTree(c, indent + 2)
    }
  }

}