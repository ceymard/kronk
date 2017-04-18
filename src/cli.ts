#!/usr/bin/node

import * as fs from 'fs'
import * as path from 'path'

import {Project} from './project'

export interface PackageJson {
  kronk: {
    src: string
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
      res.kronk.src = res.kronk.src || 'src'
      return res
    } else {
      current_dir = path.dirname(current_dir)
    }

  }

  throw new Error('could not find package.json')
}


export class Kronk {

  registerExtension(ext: string) {

  }

}

export const kronk = new Kronk()


/// 1. Look for the package.json
var pkg = getPackageJson()

/// 2. Extract basic informations to create the Project
var p = new Project(pkg.kronk.src)

/// 3. Watch or run once, which ever comes first