# PostHTML <img align="right" width="220" height="200" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

[![npm][npm]][npm-badge]
[![Build][build]][build-badge]
[![Coverage][cover]][cover-badge]
[![Chat][chat]][chat-badge]

Posthtml is a tool for transforming HTML with javascript plugins. Posthtml parses input html into an [abstract syntax tree](#posthtml-ast) (AST). Plugins receive the AST, can transform it as they wish, and return it to be passed to the next plugin. When all plugins have finished, posthtml transforms the AST into a javascript function which, when called, will produce a string of html.

## Installation

`npm i posthtml --save`

## Usage

Initialize `posthtml` with some plugins you'd like to use and [any other options](#options), then call `process` with the html you'd like to process. For example:

```js
const posthtml = require('posthtml')
const customElements = require('posthtml-custom-elements')

let html = `
    <myComponent>
      <myTitle>Super Title</myTitle>
      <myText>Awesome Text</myText>
    </myComponent>`

posthtml({ plugins: customElements })
    .process(html)
    .then((result) => {
        console.log(result.output)
        // <div class="myComponent">
        //  <div class="myTitle">Super Title</div>
        //  <div class="myText">Awesome Text</div>
        // </div>
    })
```

And a more complex example:

```js
const posthtml = require('posthtml')
const svgTags = require('posthtml-to-svg-tags')
const extendAttrs = require('posthtml-extend-attrs')

const html = '<html><body><p class="wow">OMG</p></body></html>'
const attrArgs = {
  attrsTree: {
    '.wow': {
      id: 'wow_id',
      fill: '#4A83B4',
      'fill-rule': 'evenodd',
      'font-family': 'Verdana'
    }
  }
}

posthtml({ plugins: [svgTags(), extendAttrs(attrArgs)] })
  .process(html)
  .then(function(result) {
    console.log(result.output)
    // <svg xmlns="http://www.w3.org/2000/svg">
    //  <text
    //    class="wow"
    //    id="wow_id" fill="#4A83B4"
    //    fill-rule="evenodd" font-family="Verdana">
    //     OMG
    //  </text>
    // </svg>
  })
```

### Options

None of the options are required, any of them may be skipped.

| Option | Description | Default |
| ------ | ----------- | ------- |
| **plugins** | Either a single plugin or an array of plugins to be used | `[]`
| **parser** | Override the default parser | [posthtml-parser](https://github.com/posthtml/posthtml-parser)
| **generator** | Override the default code generator | [posthtml-render](https://github.com/posthtml/posthtml-render)
| **parserOptions** | Options to be passed to the parser |
| **generatorOptions** | Options to be passed to the code generator |
| **filename** | Name of the file being processed, for debugging. |

A quick example, using [sugarml](https://github.com/posthtml/sugarml), a jade-like, whitespace-based custom parser:

```js
const posthtml = require('posthtml')
const sugarml = require('sugarml')

const html = `
  #main
    p hello world!
`

posthtml({ parser: sugarml })
  .process(html)
  .then((result) => {
    console.log(result.output)
    // <div id='main'><p>hello world!</p></div>
  })
```

Options can also be passed either to the `posthtml` constructor as above, or to the `process` method. Options passed to `posthtml` will persist between compiles, where options passed to `process` will only apply for that particular compile. Options passed to the `process` plugin will be deep-merged with existing options and take priority if there is a conflict. For example:

```js
const ph = posthtml({ plugins: [example(), anotherExample()] })

ph.process(someHtml, { filename: 'foo.html'})
ph.process(otherHtml, { filename: 'bar.html', plugins: [alternatePlugin()] })
ph.process(evenMoreHtml, { parser: someParser })
```

Here, the default plugins will apply to all compiles, except for the second, in which we override them locally. All other options will be merged in and applied only to their individual compiles.

## Posthtml AST

Plugins act on an [abstract syntax tree](https://www.wikiwand.com/en/Abstract_syntax_tree) which represents the html structure, but is easier to search and modify than plain text. It is a very simple [recursive tree structure](https://www.wikiwand.com/en/Tree_(data_structure)). Each node in the tree is represented by an object, which is required to have a `type` property. The default code generator supports three data types:

#### String

A string of plain text. The `content` property contains the string.

#### Tag

An html tag. Can optionally have an `attributes` property, which is an object with the key being a `string`, and the value being either a `string` or `code` type, or an array of multiple. Can also optionally have a `content` property, which can contain a full AST.

#### Code

A piece of code to be evaluated at runtime. Code can access any locals that the user has passed in to the function through the `locals` argument, and any runtime functions through the runtime object, which should be available in any scope that a template function is executed in. The name of the runtime object is configurable and can be accessed via `this.options.runtimeName` within any plugin. The code itself should be in the `content` attribute of the code node.

Sometimes there's a situation where you want code to surround some html, in order to control or change its appearance, for example a conditional statement. When this is the case, a special helper can be used within your code so that you can avoid needing to manually run the code generator over the contained nodes. A quick example:

```js
{
  type: 'code',
  content: `if (locals.show) {
    __nodes[0]
  } else {
    __nodes[1]
  }`,
  nodes: [
    { type: 'string', content: 'shown!', line: 1, col: 1 },
    { type: 'string', content: 'hidden!', line: 2, col: 1}
  ]
}
```

In this case, the code generator will parse the nodes in the `nodes` property and inject them at the appropriate locations in your code block. Nodes in the `nodes` property can be full ASTs, and even include more `code` nodes. Note that the `nodes` property is represented inside your code's content as `__nodes` to prevent any potential name conflicts.

Code should be expected to run in any javascript environment, from node to the browser, and in any version. As such, care should be taken to make code snippets as simple and widely-compatible as possible.

---

Additionally, all tree nodes should include information about their source, so that errors are clear, and source maps can be accurate. Each tree node must also have two additional properties:

- `line`: the line in the original source
- `col`: the column in the original source

There is a strongly encouraged `filename` option available through the posthtml options. This in combination with the `line` and `col` information can provide accurate debugging. However, if the original source comes from a different file, you can also provide a `filename` property on the tree node so that it is accurate. For example, if using `posthtml-include` to include code from a different file, this would be necessary.

#### Example

For the following file:

```html
<div id='main'>
  <p>Hello {{ planet }}</p>
</div>
```

After processing by the `posthtml-expressions` plugin, you would get the following tree:

```js
[
  {
    type: 'tag',
    name: 'div',
    attributes: {
      id: {
        type: 'string',
        content: 'main',
        line: 1,
        col: 9
      }
    },
    content: [
      {
        type: 'tag',
        name: 'p',
        content: [
          {
            type: 'string',
            content: 'Hello ',
            line: 2,
            col: 6
          },
          {
            type: 'code',
            content: 'locals.planet'
          }
        ],
        line: 2,
        col: 3
      }
    ],
    line: 1
    col: 1
  }
]
```

> NOTE: Expression parsing and the `code` node type are used entirely by plugins, posthtml does not parse any html as a `code` node by default.

Which would then be parsed into this function by the code generator:

```js
;(function (locals) {
  return "<div id=\"main\">\n  <p>Hello " + locals.planet + "</p>\n</div>"
})
```

And finally, when executed, would turn out as such:

```js
templateFunction({ planet: 'world' })
// <div id="main">
//   <p>Hello world</p>
// </div>
```

## Writing A Plugin

HTML is a simple language, and because of this, posthtml's AST is also quite simple. Plugins are represented by a function, which takes two parameters, the `ast` as described above, and an optional context object, which we will discuss below. All plugins must return an AST. Here's a minimal plugin:

```js
module.exports = function (ast) {
  console.log('hello from the plugin!')
  return ast
}
```

Now let's say we wanted to make a plugin that removes any tag with a `removeme` class. We could do this using a simple [reduce](http://adripofjavascript.com/blog/drips/boiling-down-arrays-with-array-reduce.html) and a bit of [recursion](https://www.codecademy.com/courses/javascript-lesson-205/0/1).

```js
module.exports = function walk (ast) {
  ast.reduce((m, v, k) => {
    // return without adding to the memo object if we have the 'removeme' class
    if (v.attrs && v.attrs.class === 'removeme') { return m }
    // if we have contents, recurse
    if (v.contents) { v.contents = walk(v.contents) }
    // otherwise add the node to the memo and return
    m[k] = v
    return m
  }, {})
}
```

If you are not familiar with the recursion and reduction, I would strongly recommend brushing up before starting your plugin. They are extremely useful concepts across all programming languages, and especially relevant for modifying the posthtml AST.

### Accessing Options

If you are writing a plugin, it can sometimes be helpful to access posthtml's options. For example, if you were writing a plugin that allowed users to `include` a file from a different path, that file would also need to be parsed and transformed into a posthtml AST. In this case, you could pull in the parser directly from posthtml's options.

For any plugin function, the first parameter passed is the [AST](#posthtml-ast), and the second is a `context` object, which includes the full options used to execute the current compilation. For example:

```js
// myplugin.js
module.exports = function (ast, ctx) {
  console.log(ctx.options)
  return ast
}
```

This plugin would do nothing except for logging out posthtml's options. While it is possible to modify the options, it is strongly discouraged, as it may interfere with other plugins and break your build.

### The Runtime

There are two stages in which code runs in a posthtml template function. The first stage we call "compile time", and this is when the html is parsed, plugins do their things, and then a function is returned to the user. Second we call "runtime" is when the user actually executes that function.

```js
// STAGE 1 - COMPILE TIME: parsing html into a template function
posthtml([/*...plugins.. */])
  .process(someHtml)
  .then((res) => {
    console.log(res.output) // [Function]
    // STAGE 2 - RUNTIME: user executes the function
    res.output({ foo: 'bar' })
  })
```

In addition to the `options`, you might have noticed that there is a second property on the `ctx` object called `runtime`, and chances are it's an empty object. The runtime object is a place where functions can be stored that are utilized during runtime.

For example, [posthtml-expressions](#) escapes html by default inside of its expression delimiters so that if you type in `You can make a tag bold with <strong>`, it actually outputs that text, instead of a literal `<strong>` html tag. But since expressions are passed in by the user at runtime, the escaping must happen then. While it would be possible for the plugin to include the code for escaping along with every single `code` node, that it returns, this would be a huge waste of space -- it would be much easier to just have one place that the escape function could be called from at runtime. This is the purpose of the runtime object.

Within a plugin, if you'd like to add a function to the runtime, you can do this directly using `ctx.runtime`. Be careful to choose a unique name and not overwrite other plugins' runtime functions. To use a runtime function within your code, you can use the `__runtime` property, which will be transformed by the code generator to the correct name so that it will work in whatever environment it's used in. For example:

```js
module.exports = function (ast, ctx) {
  ctx.runtime.escapeHtml = (str) => { /* ...implementation... */}
  ast.push({
    type: 'code',
    content: '__runtime.escapeHtml(\'<strong>\')',
    line: 1,
    col: 1
  })
  return ast
}
```

This is pseudo-code and is just for demonstration purposes, but you can see what's happening here. A function is defined on the `ctx.runtime` object, and used within the code later with `__runtime`. This way, you can avoid repetition when you need to be executing runtime code from a plugin.

### Error Handling

If you need to throw an error from a plugin, posthtml provides a convenient error class that you can utilize to provide the user with a consistent error message that makes it clear from where the error came. You can find it on `ctx.PluginError` inside any plugin function. A silly example:

```js
// myplugin.js
module.exports = function (tree, ctx) {
  if (tree[0] !== 'object') {
    throw new ctx.PluginError({
      plugin: 'useless_plugin'
      message: 'First node must be an object!',
      node: tree[0]
    })
  }
}
```

If this error was hit, it would provide a nice clean message to the user, like this:

```
Error: First node must be an object!
From: useless_plugin
Location: `/Users/me/Desktop/test-project/index.html`, Line 1, Column 3

<p>foo bar</p>
   ^

...rest of the error trace...
```

While you can throw any type of error you'd like, we strongly recommend using the error helper for consistent and clear messaging for your users.

## Usage In Build Systems

- **Command Line**: [posthtml-cli](https://github.com/gitscrum/posthtml-cli)
- **Gulp**: [gulp-posthtml](https://www.npmjs.com/package/gulp-posthtml)
- **Grunt**: [grunt-posthtml](https://www.npmjs.com/package/grunt-posthtml)
- **Webpack**: [posthtml-loader](https://www.npmjs.com/package/posthtml-loader)
- **Koa**: [koa-posthtml](https://github.com/michael-ciniawsky/koa-posthtml)
- **Hapi**: [hapi-posthtml](https://github.com/michael-ciniawsky/hapi-posthtml)
- **Express**: [express-posthtml](https://github.com/michael-ciniawsky/express-posthtml)
- **Electron**: [electron-posthtml](https://github.com/michael-ciniawsky/electron-posthtml)

## Plugins
Take a look at the searchable [Plugins Catalog](http://maltsev.github.io/posthtml-plugins/) for PostHTML plugins.

|Plugin|Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|Description|
|:-----|:-----|:----------|
|[posthtml-bem][bem]| [![npm][bem-badge]][bem-npm] |Support BEM naming in html structure|
|[posthtml-postcss][css]|[![npm][css-badge]][css-npm]|Use [PostCSS][css-gh] in HTML document|
|[posthtml-retext][text]|[![npm][text-badge]][text-npm]|Extensible system for analysing and manipulating natural language|
|[posthtml-custom-elements][elem]|[![npm][elem-badge]][elem-npm]| Use custom elements now |
|[posthtml-web-component][web]|[![npm][web-badge]][web-npm]|Web Component ServerSide Rending, Component as Service in Server|
|[posthtml-inline-css][in]|[![npm][in-badge]][in-npm]|CSS Inliner|
|[posthtml-style-to-file][style]|[![npm][style-badge]][style-npm]| Save HTML style nodes and attributes to CSS file|
|[posthtml-px2rem][px2rem]|[![npm][px2rem-badge]][px2rem-npm]|Change px to rem in HTML inline CSS|
|[posthtml-classes][classes]|[![npm][classes-badge]][classes-npm]|Get a list of classes from HTML|
|[posthtml-doctype][doctype]|[![npm][doctype-badge]][doctype-npm]|Extend html tags doctype|
|[posthtml-include][include]|[![npm][include-badge]][include-npm]|Include html file|
|[posthtml-to-svg-tags][svg]|[![npm][svg-badge]][svg-npm]|Convert html tags to svg equals|
|[posthtml-extend-attrs][attrs]|[![npm][attrs-badge]][attrs-npm]| Extend html tags attributes with custom data and attributes|
|[posthtml-modular-css][modular]|[![npm][modular-badge]][modular-npm]|Makes css modular|
|[posthtml-static-react][react]|[![npm][react-badge]][react-npm]| Render custom elements as static React components |
|[posthtml-head-elements][head]|[![npm][head-badge]][head-npm]|Store head elements (title, script, link, base and meta) in a JSON file and render them into the document during the build process|
|[posthtml-prefix-class][prefix]|[![npm][prefix-badge]][prefix-npm]|Prefix class names
|[posthtml-collect-inline-styles][collect]|[![npm][collect-badge]][collect-npm]|Collect inline styles and insert to head tag|
|[posthtml-transformer][transform]|[![npm][transform-badge]][transform-npm]|process HTML by directives in node attrs, such as inline scripts and styles, remove useless tags, concat scripts and styles etc.|
|[posthtml-inline-assets][assets]|[![npm][assets-badge]][assets-npm]|Inline external scripts, styles, and images in HTML|
|[posthtml-schemas][schemas]|[![npm][schemas-badge]][schemas-npm]|Add schema.org microdata to your markup super easy|
|[posthtml-extend][extend] |[![npm][extend-badge]][extend-npm]|Templates extending (Jade-like) |
|[posthtml-img-autosize][img]|[![npm][img-badge]][img-npm]|Auto setting the width and height of \<img\>|
|[posthtml-aria-tabs][aria]|[![npm][aria-badge]][aria-npm]|Write accessible tabs with minimal markup|
|[posthtml-lorem][lorem]|[![npm][lorem-badge]][lorem-npm]|Add lorem ipsum placeholder text to any document|
|[posthtml-md][md]|[![npm][md-badge]][md-npm]|Easily use context-sensitive markdown within HTML|
|[posthtml-alt-always][alt]|[![npm][alt-badge]][alt-npm]|Always add alt attribute for images that don't have it (accessibility reasons)|
|[posthtml-css-modules][css-modules]|[![npm][css-modules-badge]][css-modules-npm]|Use CSS modules in HTML|
|[posthtml-jade][jade]|[![npm][jade-badge]][jade-npm]|Jade templates/syntax support|
|[posthtml-exp][exp]|[![npm][exp-badge]][exp-npm]|Add template expressions to your HTML|
|[posthtml-tidy][tidy]|[![npm][tidy-badge]][tidy-npm]|Sanitize HTML with HTML Tidy on the fly|
|[posthtml-hint][hint]|[![npm][hint-badge]][hint-npm]|Lint HTML with HTML Hint|
|[posthtml-w3c][w3c]|[![npm][w3c-badge]][w3c-npm]|Validate HTML with W3C Validation|
|[posthtml-load-plugins][load]|[![npm][load-badge]][load-npm]|Auto-load Plugins for PostHTML|
|[posthtml-remove-attributes][remove]|[![npm][remove-badge]][remove-npm]|Remove attributes unconditionally or with content match|
|[posthtml-minifier][minifier]|[![npm][minifier-badge]][minifier-npm]|Minify HTML|
|[posthtml-shorten][shorten]|[![npm][shorten-badge]][shorten-npm]|Shorten URLs in HTML elements|
|[posthtml-uglify][uglify]|[![npm][uglify-badge]][uglify-npm]|Rewrite CSS identifiers in HTML to be shortened|
|[posthtml-modules][modules]|[![npm][modules-badge]][modules-npm]|Posthtml modules processing|
|[posthtml-postcss-modules][postcss-modules]|[![npm][postcss-modules-badge]][postcss-modules-npm]|CSS Modules in html|
|[posthtml-collect-styles][collect-styles]|[![npm][collect-styles-badge]][collect-styles-npm]|Collect styles from html and put it in the head|
|[posthtml-remove-duplicates][remove-duplicates]|[![npm][remove-duplicates-badge]][remove-duplicates-npm]|Remove duplicate elements from your html|

## License
MIT

[npm]: https://img.shields.io/npm/v/posthtml.svg
[npm-badge]: https://npmjs.com/package/posthtml

[chat]: https://badges.gitter.im/posthtml/posthtml.svg
[chat-badge]: https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"

[build]: https://travis-ci.org/posthtml/posthtml.svg?branch=master
[build-badge]: https://travis-ci.org/posthtml/posthtml?branch=master

[cover]: https://coveralls.io/repos/posthtml/posthtml/badge.svg?branch=master
[cover-badge]: https://coveralls.io/r/posthtml/posthtml?branch=master

[parser]: https://github.com/posthtml/posthtml-parser
[render]: https://github.com/posthtml/posthtml-render

[docs]: https://github.com/posthtml/posthtml/blob/master/docs

[bem]: https://github.com/rajdee/posthtml-bem
[bem-badge]: https://img.shields.io/npm/v/posthtml-bem.svg
[bem-npm]: https://npmjs.com/package/posthtml-bem

[css]: https://github.com/posthtml/posthtml-postcss
[css-badge]: https://img.shields.io/npm/v/posthtml-postcss.svg
[css-npm]: https://npmjs.com/package/posthtml-postcss
[css-gh]: https://github.com/postcss/postcss

[text]: https://github.com/voischev/posthtml-retext
[text-badge]: https://img.shields.io/npm/v/posthtml-retext.svg
[text-npm]: https://npmjs.com/package/posthtml-retext

[elem]: https://github.com/posthtml/posthtml-custom-elements
[elem-badge]: https://img.shields.io/npm/v/posthtml-custom-elements.svg
[elem-npm]: https://npmjs.com/package/posthtml-custom-elements

[web]: https://github.com/island205/posthtml-web-component
[web-badge]: https://img.shields.io/npm/v/posthtml-web-component.svg
[web-npm]: https://npmjs.com/package/posthtml-web-components

[in]: https://github.com/maltsev/posthtml-inline-css
[in-badge]: https://img.shields.io/npm/v/posthtml-inline-css.svg
[in-npm]: https://npmjs.com/package/posthtml-inline-css

[style]: https://github.com/posthtml/posthtml-style-to-file
[style-badge]: https://img.shields.io/npm/v/posthtml-style-to-file.svg
[style-npm]: https://npmjs.com/package/posthtml-style-to-file

[px2rem]: https://github.com/weixin/posthtml-px2rem
[px2rem-badge]: https://img.shields.io/npm/v/posthtml-px2rem.svg
[px2rem-npm]: https://npmjs.com/package/posthtml-px2rem

[classes]: https://github.com/rajdee/posthtml-classes
[classes-badge]: https://img.shields.io/npm/v/posthtml-classes.svg
[classes-npm]: https://npmjs.com/package/posthtml-classes

[doctype]: https://github.com/posthtml/posthtml-doctype
[doctype-badge]: https://img.shields.io/npm/v/posthtml-doctype.svg
[doctype-npm]: https://npmjs.com/package/posthtml-doctype

[include]: https://github.com/posthtml/posthtml-include
[include-badge]: https://img.shields.io/npm/v/posthtml-include.svg
[include-npm]: https://npmjs.com/package/posthtml-include

[svg]: https://github.com/theprotein/posthtml-to-svg-tags
[svg-badge]: https://img.shields.io/npm/v/posthtml-to-svg-tags.svg
[svg-npm]: https://npmjs.com/package/posthtml-to-svg-tags

[attrs]: https://github.com/theprotein/posthtml-extend-attrs
[attrs-badge]: https://img.shields.io/npm/v/posthtml-extend-attrs.svg
[attrs-npm]: https://npmjs.com/package/posthtml-extend-attrs

[modular]: https://github.com/admdh/posthtml-modular-css
[modular-badge]: https://img.shields.io/npm/v/posthtml-modular-css.svg
[modular-npm]: https://npmjs.com/package/posthtml-modular-css

[react]: https://github.com/rasmusfl0e/posthtml-static-react
[react-badge]: https://img.shields.io/npm/v/posthtml-static-react.svg
[react-npm]: https://npmjs.com/package/posthtml-static-react

[head]: https://github.com/TCotton/posthtml-head-elements
[head-badge]: https://img.shields.io/npm/v/posthtml-head-elements.svg
[head-npm]: https://npmjs.com/package/posthtml-head-elements

[prefix]: https://github.com/stevenbenisek/posthtml-prefix-class
[prefix-badge]: https://img.shields.io/npm/v/posthtml-prefix-class.svg
[prefix-npm]: https://npmjs.com/package/posthtml-prefix-class

[collect]: https://github.com/totora0155/posthtml-collect-inline-styles
[collect-badge]: https://img.shields.io/npm/v/posthtml-collect-inline-styles.svg
[collect-npm]: https://npmjs.com/package/posthtml-collect-inline-styles

[transform]: https://github.com/flashlizi/posthtml-transformer
[transform-badge]: https://img.shields.io/npm/v/posthtml-transformer.svg
[transform-npm]: https://npmjs.com/package/posthtml-transformer

[assets]: https://github.com/jonathantneal/posthtml-inline-assets
[assets-badge]: https://img.shields.io/npm/v/posthtml-inline-assets.svg
[assets-npm]: https://npmjs.com/package/posthtml-inline-assets

[schemas]: https://github.com/jonathantneal/posthtml-schemas
[schemas-badge]: https://img.shields.io/npm/v/posthtml-schemas.svg
[schemas-npm]: https://npmjs.com/package/posthtml-schemas

[extend]: https://github.com/maltsev/posthtml-extend
[extend-badge]: https://img.shields.io/npm/v/posthtml-extend.svg
[extend-npm]: https://npmjs.com/package/posthtml-extend

[img]: https://github.com/maltsev/posthtml-img-autosize
[img-badge]: https://img.shields.io/npm/v/posthtml-img-autosize.svg
[img-npm]: https://npmjs.com/package/posthtml-img-autosize

[aria]: https://github.com/jonathantneal/posthtml-aria-tabs
[aria-badge]: https://img.shields.io/npm/v/posthtml-aria-tabs.svg
[aria-npm]: https://npmjs.com/package/posthtml-aria-tabs

[lorem]: https://github.com/jonathantneal/posthtml-lorem
[lorem-badge]: https://img.shields.io/npm/v/posthtml-lorem.svg
[lorem-npm]: https://npmjs.com/package/posthtml-lorem

[md]: https://github.com/jonathantneal/posthtml-md
[md-badge]: https://img.shields.io/npm/v/posthtml-md.svg
[md-npm]: https://npmjs.com/package/posthtml-md

[alt]: https://github.com/ismamz/posthtml-alt-always
[alt-badge]: https://img.shields.io/npm/v/posthtml-alt-always.svg
[alt-npm]: https://npmjs.com/package/posthtml-alt-always

[css-modules]: https://github.com/maltsev/posthtml-css-modules
[css-modules-badge]: https://img.shields.io/npm/v/posthtml-css-modules.svg
[css-modules-npm]: https://npmjs.com/package/posthtml-css-modules

[jade]: https://github.com/michael-ciniawsky/posthtml-jade
[jade-badge]: https://img.shields.io/npm/v/posthtml-jade.svg
[jade-npm]: https://npmjs.com/package/posthtml-jade

[tidy]: https://github.com/michael-ciniawsky/posthtml-tidy
[tidy-badge]: https://img.shields.io/npm/v/posthtml-tidy.svg
[tidy-npm]: https://npmjs.com/package/posthtml-tidy

[hint]: https://github.com//michael-ciniawsky/posthtml-hint
[hint-badge]: https://img.shields.io/npm/v/posthtml-hint.svg
[hint-npm]: https://npmjs.com/package/posthtml-hint

[w3c]: https://github.com/michael-ciniawsky/posthtml-w3c
[w3c-badge]: https://img.shields.io/npm/v/posthtml-w3c.svg
[w3c-npm]: https://npmjs.com/package/posthtml-w3c

[exp]: https://github.com/michael-ciniawsky/posthtml-exp
[exp-badge]: https://img.shields.io/npm/v/posthtml-exp.svg
[exp-npm]: https://npmjs.com/package/posthtml-exp

[load]: https://github.com/michael-ciniawsky/posthtml-load-plugins
[load-badge]: https://img.shields.io/npm/v/posthtml-load-plugins.svg
[load-npm]: https://npmjs.com/package/posthtml-load-plugins

[remove]: https://github.com/princed/posthtml-remove-attributes
[remove-badge]: https://img.shields.io/npm/v/posthtml-remove-attributes.svg
[remove-npm]: https://npmjs.com/package/posthtml-remove-attributes

[minifier]: https://github.com/Rebelmail/posthtml-minifier
[minifier-badge]: https://img.shields.io/npm/v/posthtml-minifier.svg
[minifier-npm]: https://npmjs.com/package/posthtml-minifier

[shorten]: https://github.com/Rebelmail/posthtml-shorten
[shorten-badge]: https://img.shields.io/npm/v/posthtml-shorten.svg
[shorten-npm]: https://npmjs.com/package/posthtml-shorten

[uglify]: https://github.com/Rebelmail/posthtml-uglify
[uglify-badge]: https://img.shields.io/npm/v/posthtml-uglify.svg
[uglify-npm]: https://npmjs.com/package/posthtml-uglify

[modules]: https://github.com/canvaskisa/posthtml-modules
[modules-badge]: https://img.shields.io/npm/v/posthtml-modules.svg
[modules-npm]: https://npmjs.com/package/posthtml-modules

[postcss-modules]: https://github.com/canvaskisa/posthtml-postcss-modules
[postcss-modules-badge]: https://img.shields.io/npm/v/posthtml-postcss-modules.svg
[postcss-modules-npm]: https://npmjs.com/package/posthtml-postcss-modules

[collect-styles]: https://github.com/canvaskisa/posthtml-collect-styles
[collect-styles-badge]: https://img.shields.io/npm/v/posthtml-collect-styles.svg
[collect-styles-npm]: https://npmjs.com/package/posthtml-collect-styles

[remove-duplicates]: https://github.com/canvaskisa/posthtml-remove-duplicates
[remove-duplicates-badge]: https://img.shields.io/npm/v/posthtml-remove-duplicates.svg
[remove-duplicates-npm]: https://npmjs.com/package/posthtml-remove-duplicates
