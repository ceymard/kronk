#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const c = require('colors')

const toml = require('toml')
const yaml = require('yamljs')
const rr = require('recursive-readdir')

const pug = require('pug')
const md = new (require('markdown-it'))()

// First, find the config file.
var config = null

const W = c.bold.yellow(' /!\\ ')
const E = c.bold.red(' !! ')
const N = c.bold.green(' => ')

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

const meta = /^(\+\+\+|\-\-\-|\.\.\.)((?:.|\r?\n)*)\1$((?:.|\r?\n)*)/m

class FileArray extends Array {

  in(dir) {
    if (!dir[dir.length - 1] === '/')
      dir = dir + '/'

    return this.filter(f => f.name.indexOf(dir) === 0)
  }

}

process.chdir(config.src_dir)

rr('.', function (err, results) {

  var files = new FileArray()

  for (var file of results) {
    var contents = fs.readFileSync(file, 'utf-8')
    var parsed_file = meta.exec(contents)

    if (!parsed_file) {
      // FIXME issue a warning
      console.warn(`${W} ${c.yellow(file)} does not have a meta section.`)
      continue
    }

    var meta_type = parsed_file[1] === '+++' ? 'toml' :
      parsed_file[1] === '---' ? 'yaml' : 'json'

    var meta_section = parsed_file[2]
    var content_section = parsed_file[3]
    var parsed_meta = null

    try {
      if (meta_type === 'toml')
        parsed_meta = toml.parse(meta_section)
      else if (meta_type === 'yaml')
        parsed_meta = yaml.load(meta_section)
      else
        parsed_meta = JSON.parse(meta_section)
    } catch (e) {
      console.warn(`${file} error in meta ${e.message} (${meta_type})`)
    }

    var ext = path.extname(file)

    files.push({
      full_name: file,
      name: file.replace(new RegExp(`${ext}$`, 'i'), ''),
      basename: path.basename(file),
      dirname: path.dirname(file),
      ext: ext,
      meta: parsed_meta,
      contents: content_section
    })
  }

  // console.log(files)

  var build_dir = path.join(config.project_dir, config.build_dir)

  for (var f of files) {
    // skip files starting with '_'
    if (f.basename[0] === '_') continue

    var rendered = 'nothing to see here, move along.'

    if (f.ext === '.md') {

      rendered = md.render(f.contents)

    } else if (f.ext === '.pug') {

      try {
        rendered = pug.compile(f.contents, {
          filename: f.name,
          basedir: path.join(config.project_dir, config.templates_dir),
          pretty: config.pug.pretty
        })({
          $file: f,
          $conf: config,
          $files: files
        })
      } catch (e) {
        console.error(`${E} ${c.red(f.full_name)} ${e.message}`)
        continue
      }

    }

    mkdirp.sync(path.join(build_dir, f.dirname))
    fs.writeFileSync(path.join(build_dir, f.name + '.html'), rendered, {encoding: 'utf-8'})
    var html_file = f.name + '.html'
    console.log(`${N} ${c.green(html_file)}`)
    // Render in their respective folder.
  }
})
