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

Kronk uses a `package.json` to allow you to install libraries that you can use in
javascript files in the `src` directory. FIXME : section about javascript files.

Metadata
=============

## File Meta

Like hugo or jekyll, kronk allows you to define metadata in the very files that
are to be rendered at their begining. A simple marker is used before and after the
metadata that indicates which format we deal with.

We use `+++` for toml, `---` for yaml and `...` for json.

In the case of json, the `{` and `}` surrounding the object are optional.

In pug templates we can access this metadata directly as it is injected into the locals.

Do not use the `kronk` key for you own data as it has a special meaning.

```jade
...
// This is a json5 metadata section.
title: 'my title'
...

h1 Displaying the title : #{title}


```

## Inheritance

Whenever a `__meta__.{json|json5|yaml|yml|toml|js}` file is defined in a directory,
all the other files will merge its content into their own metadata.

Subdirectories inherit their parent's `__meta__` files.

In the case that we have a `__meta__.js`, the metadata will be looked inside the `module.exports`
variable.


# Javascript Files

To allow for maximal flexibility, you can have plain javascript files in your `src/` directory.

These files are not rendered like `.pug` or `.md` files ; instead, kronk expects their `module.exports`
to be a function.

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

`.js` files can also be used as a `__meta__.js` entry, which will then use the `module.exports` to merge

# Markdown Handling

Markdown is always injected in the end into a pug template, which is by default `/markdown.pug` into
the `markdown` block by default.

If you wish to override these defaults, use the `kronk.markdown_template` and `kronk.markdown_block` file metadata variables.

# API

## Special metadata variables

Here is the list of variables that kronk uses inside the file metadata ;

* `output_filename` use this variable to override the default file name that will
   be assigned to the built file, which is by default `<$file.name>.html`. Useful when
   rendering manually.

* `kronk.markdown_template` is the name of the pug template in which a markdown file will be injected.
* `kronk.markdown_block` is the name of the block inside this template.
* `kronk.draft` if true, this file will not be generated

* `$files` the array of all the files parsed inside the `src` directory
* `$file` the current file
