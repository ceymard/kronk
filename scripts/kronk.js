#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const c = require('colors')

const deepmerge = require('deepmerge')

const toml = require('toml')
const yaml = require('yamljs')
const rr = require('recursive-readdir')


const W = c.bold.yellow(' \u2717 ')
const E = c.bold.red(' \u2717 ')
const N = c.bold.green(' \u2713 ')

const _file = require('../lib/file')
const FileArray = _file.FileArray
const File = _file.File

////////////////////////////////////////////////////////////////

// First, find the config file.
var config = null

while (process.cwd() !== '/') {

  if (fs.existsSync('package.json')) {
    config = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    break
  }

  process.chdir('..')
}

if (!config || !config.kronk) {
  console.error(`${E} there is no package.json or no "kronk" entry in the package.json`)
  process.exit(1)
}

config = config.kronk

config.build = path.resolve(config.build || 'build')
config.templates = path.resolve(config.templates || 'templates')
config.src = path.resolve(config.src || 'src')

process.chdir(config.src)

rr('.', function (err, results) {

  var files = new FileArray()
  var meta_stack = []

  results.sort()

  for (var filename of results) {
    var contents = fs.readFileSync(filename, 'utf-8')

    try {
      var file = new File(filename, contents)
      files.push(file)
      file.$files = files
      file.$conf = config
      file.stat = fs.statSync(filename)

      while (meta_stack.length && file.dirname.indexOf(meta_stack[meta_stack.length - 1].dirname) === -1) {
        meta_stack.pop()
      }

      file.meta = deepmerge((meta_stack[meta_stack.length - 1] || {}).meta || {}, file.meta)

      if (file.noextbasename === '__meta__') {
        meta_stack.push(file)
      }

    } catch (e) {
      console.warn(`${W} ${c.yellow(filename)} ${e.message}`)
    }

  }

  for (var f of files) {

    if (f.ext === '.js') {
      require(f.path)(f, files, config)
    }

    if (!f.renderable() || f.basename[0] === '_') continue

    try {
      f.render()
    } catch (e) {
      console.error(`${E} ${c.red(f.filename)} ${e.stack}`)
      continue
    }
  }
})
