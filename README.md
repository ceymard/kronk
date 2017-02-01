Kronk, a simple static website generator
========================================

Kronk helps you create your static website, be it a blog or any other kind
of presentational content that don't really require any kind of logic.

It was built on the assumption that batteries included are always nice but
are also a pain to learn, which is why it tries to provide a very simple
way of working that allows for complicated things to be achieved without
much hassle.

This is why this documentation is on the light side ; kronk simply does not do much.

It mostly relies on pug for the templating side, markdown when you want to stay simple and
`toml`, `yaml` and `json5` for the metadata definition.

TL;DR
=====

```sh
$ npm install -g kronk
$ git clone https://github.com/ceymard/kronk-sample-site
$ cd kronk-sample-site
$ kronk
```

Getting Started
===============

For kronk to build a site, it needs a `package.json` file at the root of the project with
at least a `"kronk": {}` entry in it. This variable can hold the following values ;

```json
  // ...
  "kronk": {
    "src": "<the directory containing the site sources, defaults to 'src'>",
    "template": "<the directory containing the pug templates, defaults to 'template'>",
    "build": "<the directory where the generated files will be placed, defaults to 'build'>"
  },
  // ...
```

Kronk uses a `package.json` for its configuration to allow you to install libraries that
you can use in javascript files in the `src` directory. The configuration object contains only
paths ; this is because the behaviour altering options are always defined in metadatas.

When run, kronk will look up the package.json, read all the files in the `src` directory
and render all those that do not start with `_` and that have either the `.md` or `.pug`
extensions into the `build` directory.

Note that *all* the files are read, even those that will not be rendered. This is so that
those that will be can still access their metadata in their templates.

To get a hang of kronk, try cloning the [sample project](https://github.com/ceymard/kronk-sample-site).

# Metadata

## File Meta

Like hugo or jekyll, kronk allows you to define metadata in the very files that
are to be rendered at their begining. A simple marker is used before and after the
metadata that indicates which format we deal with.

We use `+++` for toml, `---` for yaml and `...` for json.

In the case of json, the `{` and `}` surrounding the object are optional.

In pug templates we can access this metadata directly as it is injected into the locals.

```jade
---
// This is a yaml metadata section.
title: my title
---

h1 Displaying the title : #{title}


```

In addition to the metadata defined in this file and inherited via `__meta__` files,
two variables are passed to the template : `$file` which is a [File](#File) instance, and
`$files` which is a [FileArray](#FileArray) instance.

## Pure meta files

Sometimes, it is useful to define a file that is pure data and is not meant to be rendered.
You can thus have


## Inheritance

Whenever a `__meta__.{json|json5|yaml|yml|toml|js}` file is defined in a directory,
all the other files in the same directory will deep merge its content into their own metadata.

In the case that we have a `__meta__.js` file, the metadata will be looked inside its `module.exports`
variable.

The metadata defined in a template file has precedence over the `__meta__` files.

Subdirectories inherit their parent directory's `__meta__` files. It is thus possible to have
a hierarchy of `__meta__` files that get enriched the further down the tree we go. When merging,
children have priority over parents.

For instance, in the following example, index.pug merges the `__meta__.json`'s contents into
its own metadata and that's it.

`file1.md` and `file2.md` however will have the contents of `__meta__.json` and `__meta__.yml` merged
into their own metadata.

```
 .- __meta__.json
 |- index.pug
 |-. docs
   |- __meta__.yml
   |- file1.md
   `- file2.md
```

# Javascript Files

To allow for maximal flexibility, you can have plain javascript files in your `src/` directory.

These files are not rendered like `.pug` or `.md` files ; instead, kronk expects their `module.exports`
to be a function and runs it at render time.

```javascript
// Example of a javascript file that uses a template not normally rendered to
// render it multiple times.

/**
 * @param $file: the current file object
 * @param $files: The global files array
 */
module.exports = function ($file, $files) {

  var template = $files.get('docs/_category')

  for (var meta of $files.in('docs').map(f => f.meta)) {
    template.render({
      output_filename: `docs/category_${meta.tag}.html`,
      // ... add some other variables for the template to use
    })
  }
}

```

`.js` files can also be used as a `__meta__.js` entry, which will then use the `module.exports` as the meta object.

# Markdown Handling

Markdown files are generated and injected into a pug template. By default, this template is ;

```
extends /markdown.pug

block markdown
  | ... the result of
  | the generation of the markdown is put here.

```

This pug template uses the local metadata as well, which means that interpolation in your markdown
is possible using the `#{variable}` syntax.

If you wish to override these defaults, use the `kronk.markdown_template` and `kronk.markdown_block` file metadata variables.

# API

<a name="FileArray"/>
## FileArray

When kronk is run, all the files of the `src` directory are added to a file array.
This array is passed to all the templates so that a file may access other files
metadata.

### Methods

* `get(name: string): File` Gets the file object of the same name. `null` if
  the file does not exist. All files can be accessed this way, even the pure data ones.

* `in(dir: string, shallow = false): FileArray` Filter the files to only include the files
  in the specified directory and its children. If `shallow` is true, do not descend into
  subdirectories.

* `renderable(): FileArray` Only the renderable files


<a name="File"/>
## File

The file object holds informations about a file that has been read by kronk.

### Methods

* `renderable(): boolean` true if the file can be rendered (usually just because
  it is markdown or pug)
* `render(meta: object = {}): void` render the file to the file system, merging
  the additionnal meta to the `file.meta`. This does not change `file.meta`.

### Properties

* `name: string` the name of the file with its path relative to `src/` but without extension
* `basename: string` the basename of the file
* `noextbasename: string` the basename without extension
* `path: string` the absolute path of this file
* `ext: string` the file extension
* `dirname: string` the directory name relative to `src/`
* `stat: StatObject` the stat as returned by `fs.stat()`

* `contents: string` the original contents of the file without the metadata section

* `meta: object` the parsed metadata with `__meta__` files already merged into it. *not enumerable*
* `$files: FileArray` the FileArray this File belongs to. *not enumerable*

## Special metadata variables

Some metadata values are interpreted by kronk and not left only to your templates.
They all live inside the `kronk` object to avoid clashing with your own naming.

* `kronk.output_filename` the name of the file that will be written in `build` when `render()`
   is called on this file. *default* `<$file.name>.html`

* `kronk.markdown_template` is the name of the pug template in which a markdown file will be injected.
   *default* `/markdown.pug`.

* `kronk.markdown_block` is the name of the block inside the markdown template. *default* `'markdown'`

* `kronk.markdown_options` the options object given to markdown-it. *default* `{}`

* `kronk.pug_options` the options object given to pug compile function. *default* `{}`
