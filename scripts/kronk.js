#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const c = require('colors')

const deepmerge = require('deepmerge')

const toml = require('toml')
const yaml = require('yamljs')
const rr = require('recursive-readdir')

// First, find the config file.
var config = null

const W = c.bold.yellow(' \u2717 ')
const E = c.bold.red(' \u2717 ')
const N = c.bold.green(' \u2713 ')

const _file = require('../lib/file')
const FileArray = _file.FileArray
const File = _file.File

while (process.cwd() !== '/') {

  var toml_path = path.join(process.cwd(), 'config.toml')
  var yaml_path = path.join(process.cwd(), 'config.yml')
  var json_path = path.join(process.cwd(), 'config.json')


  if (fs.existsSync(toml_path)) {
    config = toml.parse(fs.readFileSync(toml_path, 'utf-8'))
    break
  }

  if (fs.existsSync(yaml_path)) {
    config = yaml.load(yaml_path)
    break
  }

  process.chdir('..')
}

config.build_dir = path.resolve(config.build_dir || 'build')
config.templates_dir = path.resolve(config.templates_dir || 'templates')
config.src_dir = path.resolve(config.src_dir || 'src')
config.project_dir = path.resolve(process.cwd())

process.chdir(config.src_dir)

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

  var build_dir = path.join(config.project_dir, config.build_dir)

  for (var f of files) {


    if (f.ext === '.js') {
      require(f.full_name)(f, files, config)
    }

    if (!f.renderable() || f.basename[0] === '_') continue

    try {
      f.render()
    } catch (e) {
      console.error(`${E} ${c.red(f.filename)} ${e.message}`)
      continue
    }
  }
})
