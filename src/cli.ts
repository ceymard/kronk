#!/usr/bin/node

import * as fs from 'fs'
import * as ts from "typescript"
import * as path from 'path'
import * as chokidar from 'chokidar'

import {Cache} from './module'

if (global.v8debug) {
  global.v8debug.Debug.setBreakOnException()
}

const options: ts.CompilerOptions = {
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.React,
  jsxFactory: 'K'
}

var filenames = process.argv.slice(2)
filenames.push(path.join(__dirname, 'declarations.d.ts'))
filenames = filenames.map(f => path.resolve(f))


const wa = new chokidar.FSWatcher()

const files: ts.MapLike<{ version: number, stats: fs.Stats, source?: string }> = {};

const ca = new Cache(filenames, options)

filenames.forEach(path => wa.add(path))
wa.on('add', onFile)
wa.on('change', onFile)

//////////////////////

function onFile(path: string, stats: fs.Stats) {
  if (!files[path]) {
    files[path] = {version: 0, stats}
  } else {
    if (stats.mtime <= files[path].stats.mtime) return
    files[path].version++
  }
  ca.compile(path)
}
