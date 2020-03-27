# Plugins - Guide

A PostHTML plugin is a function that receives and, usually, transforms a HTML AST from the PostHTML parser. HTML AST has the PostHTML Tree format. [Read more about PostHTML Tree](tree.md).

The rules below are mandatory for all PostHTML plugins.

## Name with posthtml- prefix

The plugin’s purpose should be clear just by reading its name. If you wrote a transpiler for HTML Custom Elements, posthtml-custom-elements would be a good name. If you wrote a plugin to support BEM, posthtml-bem would be a good name.

The prefix posthtml- shows that the plugin is part of the PostHTML ecosystem.

This rule is not mandatory for plugins that can run as independent tools, without the user necessarily knowing that it is powered by PostHTML, e.g [htmlnano](https://github.com/maltsev/htmlnano).

## Do one thing, and do it well

Do not create multitool plugins. Several small, one-purpose plugins bundled into a plugin pack is usually a better solution.

## Plugin must be tested

A CI service like Travis is also recommended for testing code in different environments. You should test in (at least) Node.js v0.12 and stable.

## Use only the public PostHTML API

PostHTML plugins must not rely on undocumented properties or methods, which may be subject to change in any minor release. The public API is described in [API docs](api.md).

## Document in English

PostHTML plugins must have their README.md written in English. Do not be afraid of your English skills, as the open source community will fix your errors.

Of course, you are welcome to write documentation in other languages; just name them appropriately (e.g. README.ja.md).

## Include Examples (Input && Output)

The plugin's README.md must contain example input and output HTML. A clear example is the best way to describe how your plugin works.

The first section of the README.md is a good place to put examples. See [posthtml-expressions](https://github.com/posthtml/posthtml-expressions) for an example.

Of course, this guideline does not apply if your plugin does not transform the HTML.

## Maintain a CHANGELOG

PostHTML plugins must describe the changes of all their releases in a separate file, such as CHANGELOG.md, History.md, or [GitHub Releases](https://help.github.com/articles/creating-releases). Visit [Keep A Changelog](http://keepachangelog.com) for more information about how to write one of these.

Of course, you should be using [semver](http://semver.org).

## Include posthtml-plugin keyword in package.json

PostHTML plugins written for npm must have the posthtml-plugin keyword in their package.json. This special keyword will be useful for feedback about the PostHTML ecosystem.

For packages not published to npm, this is not mandatory, but is recommended if the package format can contain keywords.
