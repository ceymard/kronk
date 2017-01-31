
const path = require('path')

const toml = require('toml')
const yaml = require('yamljs')
const JSON5 = require('json5')

const pug = require('pug')
const md = new (require('markdown-it'))()


///////////////////////////////////////////////////


function parseJson(ct) {
  if (!/^[\n\r\s]*\{/.test(ct))
    ct = '{' + ct
  if (!/\}[\n\r\s]*/.test(ct))
    ct = ct + '}'
  return JSON5.parse(ct)
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
    this.ext = path.extname(filename)
    this.name = filename.replace(new RegExp(this.ext + '$'), '')

    this.dirname = path.dirname(filename)
    this.basename = path.basename(filename)
    this.noextbasename = this.basename.replace(new RegExp(this.ext + '$'), '')

    this.contents = ''
    this.meta = {}
    this.stat = {}

    // files array
    this.$files = null
    this.$conf = null

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
    return (this.ext === '.md' || this.ext === '.pug') && this.basename[0] !== '_'
      && !(this.meta.kronk||{}).draft
  }

  render() {

    if (!this.renderable()) throw new Error(`can't render ${this.filename}`)

    if (this.ext === '.md')
      return this.renderMd(this.contents)
    if (this.ext === '.pug')
      return this.renderPug(this.contents)

  }

  renderMd(contents) {
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

  renderPug(contents) {
    return pug.compile(contents, {
      filename: this.name,
      basedir: path.join(this.$conf.project_dir, this.$conf.templates_dir),
      pretty: this.$conf.pug.pretty
    })(Object.assign({
      $file: this,
      $conf: this.$conf,
      $files: this.$files,
    }, this.meta))
  }

}
