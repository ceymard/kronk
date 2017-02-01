
const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const c = require('colors')

const toml = require('toml')
const yaml = require('yamljs')
const JSON5 = require('json5')

const pug = require('pug')
const md = new (require('markdown-it'))()

const deepmerge = require('deepmerge')

const W = c.bold.yellow(' \u2717 ')
const E = c.bold.red(' \u2717 ')
const N = c.bold.green(' \u2713 ')

///////////////////////////////////////////////////


function parseJson(ct) {
  if (!/^[\n\r\s]*\{/.test(ct))
    ct = '{' + ct
  if (!/\}[\n\r\s]*/.test(ct))
    ct = ct + '}'
  return JSON5.parse(ct)
}


function _(obj, path, def) {
  if (path == null || path === '') return obj
  let pathes = path.toString().split('.')
  for (var i = 0; i < pathes.length; i++) {
    if (!obj) break
    obj = obj[pathes[i]]
  }

  if (obj === undefined && def !== undefined) return def
  return obj
}

/**
 *
 */
exports.FileArray = class FileArray extends Array {

  get(name) {
    var res = this.filter(f => f.name === name)
    return res[0]
  }

  in(dir, deep) {
    if (!dir[dir.length - 1] === '/')
      dir = dir + '/'

    return this.filter(f => f.name.indexOf(dir) === 0)
  }

  renderable() {
    return this.filter(f => f.renderable())
  }

  unrenderable() {
    return this.filter(f => !f.renderable())
  }

}


const meta = /^(\+\+\+|\-\-\-|\.\.\.)((?:.|\r?\n)*)\1$((?:.|\r?\n)*)/m


/**
 *
 */
exports.File = class File {

  /**
   * Build the file.
   */
  constructor(filename, contents, files) {
    this.filename = filename
    this.path = path.resolve(filename)
    this.ext = path.extname(filename)
    this.name = filename.replace(new RegExp(this.ext + '$'), '')

    this.dirname = path.dirname(filename)
    this.basename = path.basename(filename)
    this.noextbasename = this.basename.replace(new RegExp(this.ext + '$'), '')

    this.contents = ''

    Object.defineProperty(this, 'meta', {value: {}, writable: true})
    Object.defineProperty(this, '$files', {value: null, writable: true})
    Object.defineProperty(this, '$conf', {value: null, writable: true})

    this.meta = {}
    this.stat = {}

    this.parse(contents)
  }

  parse(contents) {
    var meta_type = null
    var meta_section = null

    if (this.ext === '.toml') {
      meta_type = 'toml'
      meta_section = contents
      this.contents = ''
    } else if (this.ext === '.yaml' || this.ext === '.yml') {
      meta_type = 'yml'
      meta_section = contents
      this.contents = ''
    } else if (this.ext === '.json' || this.ext === '.json5') {
      meta_type = 'json'
      meta_section = contents
      this.contents = ''
    } else if (this.ext === '.md' || this.ext === '.pug') {
      var parsed = meta.exec(contents)

      if (parsed) {
        meta_type =
          parsed[1] === '+++' ? 'toml' :
          parsed[1] === '---' ? 'yml' :
          'json'

        meta_section = parsed[2]
        this.contents = parsed[3]
      } else {
        this.contents = contents
      }

    } else if (this.basename === '__meta__.js') {
      this.meta = require(this.path)
    }

    if (meta_type === 'toml') {
      this.meta = toml.parse(meta_section)
    } else if (meta_type === 'yml') {
      this.meta = yaml.parse(meta_section)
    } else if (meta_type === 'json') {
      this.meta = parseJson(meta_section)
    }
  }

  /**
   * Return a boolean indicating if this file is to be rendered or not.
   *
   * A file is to be rendered if it is not pure metadata and its name
   * doesn't start with and underscore.
   */
  renderable() {
    return (this.ext === '.md' || this.ext === '.pug')
  }

  render(meta = {}) {

    meta = deepmerge(this.meta, meta)

    if (!this.renderable()) throw new Error(`can't render ${this.filename}`)

    var rendered = ''

    if (this.ext === '.md')
      rendered = this.renderMd(this.contents, meta)
    if (this.ext === '.pug')
      rendered = this.renderPug(this.contents, meta)

    var pth = meta.output_filename

    if (!pth)
      pth = this.name + '.html'
    pth = path.join(this.$conf.build, pth)

    if (rendered) {
      mkdirp.sync(path.dirname(pth))
      fs.writeFileSync(pth, rendered, {encoding: 'utf-8'})
      console.log(`${N} ${c.green(pth)}`)
    }

  }

  renderMd(contents, meta) {
    // FIXME missing template !!!
    var md_contents = md.render(contents)
    var pug_template = (this.meta.kronk||{}).markdown_template || '/markdown'
    var pug_block = (this.meta.kronk||{}).markdown_block || 'markdown'

    return this.renderPug(`
extends /${pug_template}

block ${pug_block}
${md_contents.split('\n').map(c => '  | ' + c).join('\n')}
`)
  }

  renderPug(contents, meta) {
    return pug.compile(contents, {
      filename: this.name,
      basedir: this.$conf.templates,
      pretty: _(meta, 'pug.pretty', false)
    })(Object.assign({
      $file: this,
      $files: this.$files,
    }, meta))
  }

}
