
import * as path from 'path'
import * as fs from 'mz/fs'

import {File} from './file'


export class Deps {
  // List of all the files that depend on this one.
  depends_on = new WeakMap<File, Set<File>>()
  // For a given file, lists all the files it depends on
  depended_by = new WeakMap<File, Set<File>>()

  add(by: File, on: File) {
    var set = this.depends_on.get(on)
    if (!set) {
      set = new Set<File>()
      this.depends_on.set(on, set)
    }
    set.add(by)

    set = this.depended_by.get(by)
    if (!set) {
      set = new Set<File>()
      this.depended_by.set(by, set)
    }
    set.add(on)
  }

  get(on: File): File[] {
    var set = this.depended_by.get(on)
    if (!set) return []
    return [...set]
  }

  remove(file: File) {
    for (var f of this.depends_on.get(file) || []) {
      console.log(`depended on ${f.name}`)
      var set = this.depended_by.get(f)
      if (!set) {
        continue
      }
      set.delete(file)
    }
  }
}


/**
 * The project contains all the files
 */
export class Project {

  data_files = new Set<File>()
  files = new Set<File>()

  files_by_name: {[name: string]: File} = {}
  deps = new Deps()

  constructor(public basedir: string, public dir_build: string) { }

  /**
   * Populate the files.
   */
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
    if (pth.startsWith('/')) pth = path.relative(this.basedir, pth)
    var f = File.from(this.basedir, pth, this)
    this.files_by_name[pth] = f
    if (f.basename === '__data__')
      this.data_files.add(f)
    else
      this.files.add(f)

    return f
  }

  getFile(pth: string): File | null {
    var p = path.relative(this.basedir, pth)
    return this.files_by_name[p]
  }

  removeFile(pth: string) {
    var f = this.getFile(pth)
    if (!f) return
    this.files.delete(f)
    this.data_files.delete(f)
    this.deps.remove(f)
  }

  update(pth: string) {
    var f = this.getFile(pth)
    if (f) {
      console.log(` * ${f.name} changed`)
      f.render()

      for (var f2 of this.deps.get(f)) {
        f2.render()
      }
    }
  }

  async rebuild() {
    var proms: Promise<any>[] = []

    for (var f of this.files)
      proms.push(f.render())
  }

}
