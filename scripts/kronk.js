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
const FileArray = _file.FileMap
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

config.build_dir = config.build_dir || 'build'
config.templates_dir = config.templates_dir || 'templates'
config.src_dir = config.src_dir || 'src'
config.project_dir = process.cwd()

config.pug = config.pug || {}
// used mostly for markdown
config.pug.default_block = config.pug.default_block || 'content'

process.chdir(config.src_dir)

rr('.', function (err, results) {

  var files = new FileArray()
  var meta_stack = []

  results.sort()

  for (var filename of results) {
    var contents = fs.readFileSync(filename, 'utf-8')

    try {
      var file = new File(filename, contents)
      files.add(file)
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

  files.forEach(f => {

    if (!f.renderable()) return

    try {
      var rendered = f.render(config)
      mkdirp.sync(path.join(build_dir, f.dirname))
      fs.writeFileSync(path.join(build_dir, f.name + '.html'), rendered, {encoding: 'utf-8'})
      var html_file = f.name + '.html'
      console.log(`${N} ${c.green(html_file)}`)
    } catch (e) {
      console.error(`${E} ${c.red(f.filename)} ${e.message}`)
      return
    }
  })
})
