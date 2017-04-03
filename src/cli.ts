#!/usr/bin/node

import * as fs from 'fs'
import * as path from 'path'


export interface PackageJson {
  kronk: {

  }
}


/**
 * Get the closest package.json file.
 */
function getPackageJson(current_dir: string = process.cwd()): PackageJson {

  while (current_dir !== '/') {
    var pth = path.join(current_dir, 'package.json')

    if (fs.existsSync(pth)) {
      return JSON.parse(fs.readFileSync(pth, 'utf-8'))
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

/// 2. Extract basic informations to create the Project

/// 3. Load plugins from this information (mostly file handlers)

/// 3. Watch or run once, which ever comes first
