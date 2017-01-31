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
toml, yaml and json5 for the metadata definition.

Getting Started
===============


File Metadata
=============

Like hugo or jekyll, kronk allows you to define metadata in the very files that
are to be rendered at their begining. A simple marker is used before and after the
metadata that indicates which format we deal with.

We use `+++` for toml, `---` for yaml and `...` for json.

In the case of json, the `{` and `}` surrounding the object are optional.

In pug templates we can access this metadata directly as it is injected into the locals.


```jade
...
// This is a json5 metadata section.
title = 'my title'
...

h1 Displaying the title : #{title}


```

Markdown Handling
=================

Markdown is always injected in the end into a pug template, which is by default `/markdown.pug` into
the `markdown` block by default.

If you wish to override these defaults, use the `kronk.markdown_template` and `kronk.markdown_block` file metadata variables.


Metadata Inheritance
====================

Whenever a `__meta__.{json|json5|yaml|yml|toml}` file is defined in a directory,
all the other files will merge its content into their own metadata.

Subdirectories inherit their parent's `__meta__` files.


Special metadata variables
==========================

Here is the list of variables that kronk uses inside the file metadata ;

* `kronk.markdown_template` is the name of the pug template in which a markdown file will be injected.
* `kronk.markdown_block` is the name of the block inside this template.

* `$files` the array of all the files parsed inside the `src` directory
* `$file` the current file
