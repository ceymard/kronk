#!/usr/bin/node

import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import * as m from 'minimist'

import {Project} from './project'

export interface PackageJson {
  kronk: {
    src: string,
    build: string
  }
}


/**
 * Get the closest package.json file.
 */
function getPackageJson(current_dir: string = process.cwd()): PackageJson {

  while (current_dir !== '/') {
    var pth = path.join(current_dir, 'package.json')

    if (fs.existsSync(pth)) {
      var res = JSON.parse(fs.readFileSync(pth, 'utf-8'))
      res.kronk.src = path.join(path.dirname(pth), res.kronk.src || 'src')
      res.kronk.build = path.join(path.dirname(pth), res.kronk.build || 'build')
      return res
    } else {
      current_dir = path.dirname(current_dir)
    }

  }

  throw new Error('could not find package.json')
}

/// 1. Look for the package.json
var pkg = getPackageJson()

/// 2. Extract basic informations to create the Project
var p = new Project(pkg.kronk.src, pkg.kronk.build)


process.on('unhandledRejection', (reason: Error) => {
  console.error(reason);
});


var initing = true


var args = m(process.argv.slice(2))

const watcher = chokidar.watch(pkg.kronk.src, {
  persistent: args.w ? true : false
})

watcher.on('change', (path: string) => {
  p.update(path)
})

watcher.on('add', (path: string) => {
  var f = p.addFile(path)
  if (!initing) {
    if (f.basename === '__data__')
      p.rebuild()
    else
      p.update(path)
  }
})

watcher.on('ready', () => {
  initing = false
  p.rebuild()
})

watcher.on('unlink', (path: string) => {
  p.removeFile(path)
  console.log('removed', path)
})
