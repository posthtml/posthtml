[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![code style][style]][style-url]
[![chat][chat]][chat-url]

<div align="center">
  <img width="220" height="200" title="PostHTML"    src="http://posthtml.github.io/posthtml/logo.svg">
</div>

PostHTML is a tool for transforming HTML/XML with JS plugins. PostHTML itself is very small. It includes only a HTML parser, a HTML node tree API and a node tree stringifier.

All HTML transformations are made by plugins. And these plugins are just small plain JS functions, which receive a HTML node tree, transform it, and return a modified tree.

For more detailed information about PostHTML in general take a look at the [docs][docs].

### `Dependencies`

| Name | Status | Description |
|:----:|:------:|:-----------:|
|[posthtml-parser][parser]|[![npm][parser-badge]][parser-npm]| Parser HTML/XML to PostHTMLTree |
|[posthtml-render][render]|[![npm][render-badge]][render-npm]| Render PostHTMLTree to HTML/XML |


[docs]: https://github.com/posthtml/posthtml/blob/master/docs

[parser]: https://github.com/posthtml/posthtml-parser
[parser-badge]: https://img.shields.io/npm/v/posthtml-parser.svg
[parser-npm]: https://npmjs.com/package/posthtml-parser

[render]: https://github.com/posthtml/posthtml-render
[render-badge]: https://img.shields.io/npm/v/posthtml-render.svg
[render-npm]: https://npmjs.com/package/posthtml-render

<h2 align="center">Install</h2>

```bash
npm i -D posthtml
```

<h2 align="center">Usage</h2>

### `API`

```js
import posthtml from 'posthtml'

const html = `
  <component>
    <title>Title</title>
    <text>Text</text>
  </component>
`

posthtml()
  .use(require('posthtml-custom-elements')())
  .process(html, {...options})
  .then((result) =>  console.log(result.html))
```

```html
<div class="component">
  <div class="title">Title</div>
  <div class="text">Text</div>
</div>
```

### [`CLI`](https://github.com/posthtml/posthtml-cli)

```bash
npm i -g|-D posthtml-cli
```

```json
"scripts": {
  "posthtml": "posthtml -o output.html -i input.html -c config.json"
}
```

```bash
npm run posthtml
```

### [`Gulp`](https://github.com/posthtml/gulp-posthtml)

```bash
npm i -D gulp-posthtml
```

```js
import { task, src, dest } from 'gulp'

import tap from 'gulp-tap'
import posthtml from 'gulp-posthtml'

task('html', () => {
  const options = {
    parser: require('posthtml-sugarml')()
  }

  const plugins = [
    require('posthtml-include')({ root: options.from })
  ]

  src('src/*.html')
    .pipe(tap((file) => options.from = file.path))
    .pipe(posthtml(plugins, options))
    .pipe(dest('dest'))
})
```

### [`Grunt`](https://gruntjs.com)

```bash
npm i -D grunt-posthtml
```

```js
posthtml: {
  options: {
    use: [
      require('posthtml-doctype')({ doctype: 'HTML 5' }),
      require('posthtml-include')({ root: './', encoding: 'utf-8' })
    ]
  },
  build: {
    files: [
      {
        dot: true,
        cwd: 'html/',
        src: ['*.html'],
        dest: 'tmp/',
        expand: true,
      }
    ]
  }
}
```

### [`Webpack`](https://github.com/posthtml/posthtml-loader)

```bash
npm i -D html-loader posthtml-loader
```

**webpack.config.js**
```js
const config = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          },
          {
            loader: 'posthtml-loader',
            options: {
              parser: require('posthtml-sugarml')()
              plugins: () => [...plugins]
            }
          }
        ]
      }
    ]
  }
  plugins: [
    new LoaderOptionsPlugin({
       options: {
         posthtml (ctx) {
          parser: require('posthtml-pug')
          plugins: [
            require('posthtml-include')({ root: ctx.resourcePath })
          ]
        }
      }
    })
  ]
}

export default config
```

<h2 align="center">Options</h2>

|Name|Default|Description|
|:---|:-----:|:----------|
|`to`|`undefined`|Path to file destination|
|`from`|`undefined`|Path to file source|
|`sync`|`false`|Process synchronously|
|`parser`|`posthtml-parser`|Custom parser|
|`render`|`posthtml-render`|Custom renderer|

### `Sync`

```js
import posthtml from 'posthtml'

const html = `
  <component>
    <title>Title</title>
    <text>Text</text>
  </component>
`

const result = posthtml()
  .use(require('posthtml-custom-elements')())
  .process(html, { sync: true })

console.log(result.html)
```

```html
<div class="component">
  <div class="title">Title</div>
  <div class="text">Text</div>
</div>
```

> :warning: Async Plugins can't be used in sync mode and will throw an Error. It's recommended to use PostHTML asynchronously whenever possible.

### `Parser`

```js
import sml from 'posthtml-sugarml'

posthtml().process(html, { parser: sml(options) }).then((result) => result.html)
```

| Name |Status|Description|
|:-----|:-----|:----------|
|[posthtml-pug][pug]|[![npm][pug-badge]][pug-npm]|Pug Parser|
|[posthtml-sugarml][sugar]|[![npm][sugar-badge]][sugar-npm]|SugarML Parser|


[pug]: https://github.com/posthtml/posthtml-pug
[pug-badge]: https://img.shields.io/npm/v/posthtml-pug.svg
[pug-npm]: https://npmjs.com/package/posthtml-pug

[sugar]: https://github.com/posthtml/sugarml
[sugar-badge]: https://img.shields.io/npm/v/sugarml.svg
[sugar-npm]: https://npmjs.com/package/sugarml

### [`Plugins`](http://maltsev.github.io/posthtml-plugins)

In case you want to develop your own plugin, we recommend using [posthtml-plugin-boilerplate][plugin] for getting started.

[plugin]: https://github.com/posthtml/posthtml-plugin-boilerplate

#### `TEXT`

| Name |Status|Description|
|:-----|:-----|:----------|
|[posthtml-md][md]|[![npm][md-badge]][md-npm]|Easily use context-sensitive markdown within HTML|
|[posthtml-lorem][lorem]|[![npm][lorem-badge]][lorem-npm]|Add lorem ipsum placeholder text to any document|
|[posthtml-retext][text]|[![npm][text-badge]][text-npm]|Extensible system for analysing and manipulating natural language|


[md]: https://github.com/jonathantneal/posthtml-md
[md-badge]: https://img.shields.io/npm/v/posthtml-md.svg
[md-npm]: https://npmjs.com/package/posthtml-md

[text]: https://github.com/voischev/posthtml-retext
[text-badge]: https://img.shields.io/npm/v/posthtml-retext.svg
[text-npm]: https://npmjs.com/package/posthtml-retext

[lorem]: https://github.com/jonathantneal/posthtml-lorem
[lorem-badge]: https://img.shields.io/npm/v/posthtml-lorem.svg
[lorem-npm]: https://npmjs.com/package/posthtml-lorem

#### `HTML`

|Name|Status|Description|
|:---|:----:|:----------|
|[posthtml-doctype][doctype]|[![npm][doctype-badge]][doctype-npm]|Set !DOCTYPE|
|[posthtml-head-elements][head]|[![npm][head-badge]][head-npm]|Include head elements from JSON file|
|[posthtml-include][include]|[![npm][include-badge]][include-npm]|Include HTML|
|[posthtml-modules][modules]|[![npm][modules-badge]][modules-npm]|Include and process HTML|
|[posthtml-extend][extend]|[![npm][extend-badge]][extend-npm]|Extend Layout (Pug-like)|
|[posthtml-extend-attrs][attrs]|[![npm][attrs-badge]][attrs-npm]|Extend Attrs|
|[posthtml-expressions][exp]|[![npm][exp-badge]][exp-npm]|Template Expressions|
|[posthtml-inline-assets][assets]|[![npm][assets-badge]][assets-npm]|Inline external scripts, styles, and images|
|[posthtml-static-react][react]|[![npm][react-badge]][react-npm]| Render custom elements as static React components|
|[posthtml-custom-elements][elem]|[![npm][elem-badge]][elem-npm]|Use custom elements|
|[posthtml-web-component][web]|[![npm][web-badge]][web-npm]|Web Component server-side rendering, Component as a Service (CaaS)|


[doctype]: https://github.com/posthtml/posthtml-doctype
[doctype-badge]: https://img.shields.io/npm/v/posthtml-doctype.svg
[doctype-npm]: https://npmjs.com/package/posthtml-doctype

[head]: https://github.com/TCotton/posthtml-head-elements
[head-badge]: https://img.shields.io/npm/v/posthtml-head-elements.svg
[head-npm]: https://npmjs.com/package/posthtml-head-elements

[include]: https://github.com/posthtml/posthtml-include
[include-badge]: https://img.shields.io/npm/v/posthtml-include.svg
[include-npm]: https://npmjs.com/package/posthtml-include

[modules]: https://github.com/posthtml/posthtml-modules
[modules-badge]: https://img.shields.io/npm/v/posthtml-modules.svg
[modules-npm]: https://npmjs.com/package/posthtml-modules

[content]: https://github.com/posthtml/posthtml-content
[content-badge]: https://img.shields.io/npm/v/posthtml-content.svg
[content-npm]: https://npmjs.com/package/posthtml-content

[exp]: https://github.com/posthtml/posthtml-exp
[exp-badge]: https://img.shields.io/npm/v/posthtml-exp.svg
[exp-npm]: https://npmjs.com/package/posthtml-exp

[extend]: https://github.com/posthtml/posthtml-extend
[extend-badge]: https://img.shields.io/npm/v/posthtml-extend.svg
[extend-npm]: https://npmjs.com/package/posthtml-extend

[attrs]: https://github.com/theprotein/posthtml-extend-attrs
[attrs-badge]: https://img.shields.io/npm/v/posthtml-extend-attrs.svg
[attrs-npm]: https://npmjs.com/package/posthtml-extend-attrs

[assets]: https://github.com/jonathantneal/posthtml-inline-assets
[assets-badge]: https://img.shields.io/npm/v/posthtml-inline-assets.svg
[assets-npm]: https://npmjs.com/package/posthtml-inline-assets

[elem]: https://github.com/posthtml/posthtml-custom-elements
[elem-badge]: https://img.shields.io/npm/v/posthtml-custom-elements.svg
[elem-npm]: https://npmjs.com/package/posthtml-custom-elements

[web]: https://github.com/island205/posthtml-web-component
[web-badge]: https://img.shields.io/npm/v/posthtml-web-component.svg
[web-npm]: https://npmjs.com/package/posthtml-web-components

[prefix]: https://github.com/stevenbenisek/posthtml-prefix-class
[prefix-badge]: https://img.shields.io/npm/v/posthtml-prefix-class.svg
[prefix-npm]: https://npmjs.com/package/posthtml-prefix-class

[react]: https://github.com/rasmusfl0e/posthtml-static-react
[react-badge]: https://img.shields.io/npm/v/posthtml-static-react.svg
[react-npm]: https://npmjs.com/package/posthtml-static-react

#### `CSS`

|Name|Status|Description|
|:---|:-----|:----------|
|[posthtml-bem][bem]|[![npm][bem-badge]][bem-npm]|Support BEM naming in html structure|
|[posthtml-postcss][css]|[![npm][css-badge]][css-npm]|Use [PostCSS][css-gh] in HTML document|
|[posthtml-px2rem][px2rem]|[![npm][px2rem-badge]][px2rem-npm]|Change px to rem in Inline CSS|
|[posthtml-css-modules][css-modules]|[![npm][css-modules-badge]][css-modules-npm]|Use CSS modules in HTML|
|[posthtml-postcss-modules][postcss-modules]|[![npm][postcss-modules-badge]][postcss-modules-npm]|CSS Modules in html|
|[posthtml-classes][classes]|[![npm][classes-badge]][classes-npm]|Get a list of classes from HTML|
|[posthtml-prefix-class][prefix]|[![npm][prefix-badge]][prefix-npm]|Prefix class names
|[posthtml-modular-css][modular]|[![npm][modular-badge]][modular-npm]|Make CSS modular|
|[posthtml-inline-css][in]|[![npm][in-badge]][in-npm]|CSS Inliner|
|[posthtml-collect-styles][collect-styles]|[![npm][collect-styles-badge]][collect-styles-npm]|Collect styles from html and put it in the head|
|[posthtml-collect-inline-styles][collect]|[![npm][collect-badge]][collect-npm]|Collect inline styles and insert to head tag|
|[posthtml-style-to-file][style]|[![npm][style-badge]][style-npm]| Save HTML style nodes and attributes to CSS file|
|[posthtml-color-shorthand-hex-to-six-digit][hex]|[![npm][hex-badge]][hex-npm]|Enforce all hex color codes to be 6-char long|


[bem]: https://github.com/rajdee/posthtml-bem
[bem-badge]: https://img.shields.io/npm/v/posthtml-bem.svg
[bem-npm]: https://npmjs.com/package/posthtml-bem

[css]: https://github.com/posthtml/posthtml-postcss
[css-badge]: https://img.shields.io/npm/v/posthtml-postcss.svg
[css-npm]: https://npmjs.com/package/posthtml-postcss
[css-gh]: https://github.com/postcss/postcss

[postcss-modules]: https://github.com/posthtml/posthtml-postcss-modules
[postcss-modules-badge]: https://img.shields.io/npm/v/posthtml-postcss-modules.svg
[postcss-modules-npm]: https://npmjs.com/package/posthtml-postcss-modules

[css-modules]: https://github.com/posthtml/posthtml-css-modules
[css-modules-badge]: https://img.shields.io/npm/v/posthtml-css-modules.svg
[css-modules-npm]: https://npmjs.com/package/posthtml-css-modules

[collect-styles]: https://github.com/posthtml/posthtml-collect-styles
[collect-styles-badge]: https://img.shields.io/npm/v/posthtml-collect-styles.svg
[collect-styles-npm]: https://npmjs.com/package/posthtml-collect-styles

[collect]: https://github.com/totora0155/posthtml-collect-inline-styles
[collect-badge]: https://img.shields.io/npm/v/posthtml-collect-inline-styles.svg
[collect-npm]: https://npmjs.com/package/posthtml-collect-inline-styles

[px2rem]: https://github.com/weixin/posthtml-px2rem
[px2rem-badge]: https://img.shields.io/npm/v/posthtml-px2rem.svg
[px2rem-npm]: https://npmjs.com/package/posthtml-px2rem

[classes]: https://github.com/rajdee/posthtml-classes
[classes-badge]: https://img.shields.io/npm/v/posthtml-classes.svg
[classes-npm]: https://npmjs.com/package/posthtml-classes

[prefix]: https://github.com/stevenbenisek/posthtml-prefix-class
[prefix-badge]: https://img.shields.io/npm/v/posthtml-prefix-class.svg
[prefix-npm]: https://npmjs.com/package/posthtml-prefix-class

[modular]: https://github.com/admdh/posthtml-modular-css
[modular-badge]: https://img.shields.io/npm/v/posthtml-modular-css.svg
[modular-npm]: https://npmjs.com/package/posthtml-modular-css

[in]: https://github.com/posthtml/posthtml-inline-css
[in-badge]: https://img.shields.io/npm/v/posthtml-inline-css.svg
[in-npm]: https://npmjs.com/package/posthtml-inline-css

[style-to]: https://github.com/posthtml/posthtml-style-to-file
[style-to-badge]: https://img.shields.io/npm/v/posthtml-style-to-file.svg
[style-to-npm]: https://npmjs.com/package/posthtml-style-to-file

[hex]: https://github.com/code-and-send/posthtml-color-shorthand-hex-to-six-digit
[hex-badge]: https://img.shields.io/npm/v/posthtml-color-shorthand-hex-to-six-digit.svg
[hex-npm]: https://npmjs.com/package/posthtml-color-shorthand-hex-to-six-digit

#### `IMG & SVG`

|Name|Status|Description|
|:---|:-----|:----------|
|[posthtml-img-autosize][img]|[![npm][img-badge]][img-npm]|Auto setting the width and height of \<img\>|
|[posthtml-to-svg-tags][svg]|[![npm][svg-badge]][svg-npm]|Convert html tags to svg equals|
|[posthtml-webp][webp]|[![npm][webp-badge]][webp-npm]|Add WebP support for images|


[img]: https://github.com/posthtml/posthtml-img-autosize
[img-badge]: https://img.shields.io/npm/v/posthtml-img-autosize.svg
[img-npm]: https://npmjs.com/package/posthtml-img-autosize

[svg]: https://github.com/theprotein/posthtml-to-svg-tags
[svg-badge]: https://img.shields.io/npm/v/posthtml-to-svg-tags.svg
[svg-npm]: https://npmjs.com/package/posthtml-to-svg-tags

[webp]: https://github.com/seokirill/posthtml-webp
[webp-badge]: https://img.shields.io/npm/v/posthtml-webp.svg
[webp-npm]: https://npmjs.com/package/posthtml-webp

#### `Accessibility`

|Name|Status|Description|
|:---|:-----|:----------|
|[posthtml-aria-tabs][aria]|[![npm][aria-badge]][aria-npm]|Write accessible tabs with minimal markup|
|[posthtml-alt-always][alt]|[![npm][alt-badge]][alt-npm]|Always add alt attribute for images that don't have it|
|[posthtml-schemas][schemas]|[![npm][schemas-badge]][schemas-npm]| Add microdata to your HTML|


[alt]: https://github.com/ismamz/posthtml-alt-always
[alt-badge]: https://img.shields.io/npm/v/posthtml-alt-always.svg
[alt-npm]: https://npmjs.com/package/posthtml-alt-always

[aria]: https://github.com/jonathantneal/posthtml-aria-tabs
[aria-badge]: https://img.shields.io/npm/v/posthtml-aria-tabs.svg
[aria-npm]: https://npmjs.com/package/posthtml-aria-tabs

[schemas]: https://github.com/jonathantneal/posthtml-schemas
[schemas-badge]: https://img.shields.io/npm/v/posthtml-schemas.svg
[schemas-npm]: https://npmjs.com/package/posthtml-schemas

#### `Optimization`

|Name|Status|Description|
|:---|:-----|:----------|
|[posthtml-shorten][shorten]|[![npm][shorten-badge]][shorten-npm]|Shorten URLs in HTML|
|[posthtml-uglify][uglify]|[![npm][uglify-badge]][uglify-npm]|Shorten CSS in HTML|
|[posthtml-minifier][minifier]|[![npm][minifier-badge]][minifier-npm]|Minify HTML|
|[posthtml-remove-attributes][remove]|[![npm][remove-badge]][remove-npm]|Remove attributes unconditionally or with content match|
|[posthtml-remove-tags][remove-tags]|[![npm][remove-tags-badge]][remove-tags-npm]|Remove tags with content match|
|[posthtml-remove-duplicates][remove-duplicates]|[![npm][remove-duplicates-badge]][remove-duplicates-npm]|Remove duplicate elements from your html|
|[posthtml-transformer][transform]|[![npm][transform-badge]][transform-npm]|Process HTML by directives in node attrs, such as inline scripts and styles, remove useless tags, concat scripts and styles etc.|
|[htmlnano][nano]|[![npm][nano-badge]][nano-npm]|HTML Minifier|
|[posthtml-email-remove-unused-css][unused]|[![npm][unused-badge]][unused-npm]|Remove unused CSS from email templates|


[remove]: https://github.com/princed/posthtml-remove-attributes
[remove-badge]: https://img.shields.io/npm/v/posthtml-remove-attributes.svg
[remove-npm]: https://npmjs.com/package/posthtml-remove-attributes

[remove-tags]: https://github.com/posthtml/posthtml-remove-tags
[remove-tags-badge]: https://img.shields.io/npm/v/posthtml-remove-tags.svg
[remove-tags-npm]: https://npmjs.com/package/posthtml-remove-tags

[remove-duplicates]: https://github.com/canvaskisa/posthtml-remove-duplicates
[remove-duplicates-badge]: https://img.shields.io/npm/v/posthtml-remove-duplicates.svg
[remove-duplicates-npm]: https://npmjs.com/package/posthtml-remove-duplicates

[minifier]: https://github.com/Rebelmail/posthtml-minifier
[minifier-badge]: https://img.shields.io/npm/v/posthtml-minifier.svg
[minifier-npm]: https://npmjs.com/package/posthtml-minifier

[shorten]: https://github.com/Rebelmail/posthtml-shorten
[shorten-badge]: https://img.shields.io/npm/v/posthtml-shorten.svg
[shorten-npm]: https://npmjs.com/package/posthtml-shorten

[uglify]: https://github.com/Rebelmail/posthtml-uglify
[uglify-badge]: https://img.shields.io/npm/v/posthtml-uglify.svg
[uglify-npm]: https://npmjs.com/package/posthtml-uglify

[nano]: https://github.com/maltsev/htmlnano
[nano-badge]: https://img.shields.io/npm/v/htmlnano.svg
[nano-npm]: https://npmjs.com/package/htmlnano

[unused]: https://github.com/code-and-send/posthtml-email-remove-unused-css
[unused-badge]: https://img.shields.io/npm/v/posthtml-email-remove-unused-css.svg
[unused-npm]: https://npmjs.com/package/posthtml-email-remove-unused-css

[transform]: https://github.com/flashlizi/posthtml-transformer
[transform-badge]: https://img.shields.io/npm/v/posthtml-transformer.svg
[transform-npm]: https://npmjs.com/package/posthtml-transformer

#### `Workflow`

|Name|Status|Description|
|:---|:-----|:----------|
|[posthtml-load-plugins][plugins]|[![npm][plugins-badge]][plugins-npm]|Autoload Plugins
|[posthtml-load-options][options]|[![npm][options-badge]][options-npm]|Autoload Options|
|[posthtml-load-config][config]|[![npm][config-badge]][config-npm]|Autoload Config (Plugins && Options)|
|[posthtml-w3c][w3c]|[![npm][w3c-badge]][w3c-npm]|Validate HTML with W3C Validation|
|[posthtml-hint][hint]|[![npm][hint-badge]][hint-npm]|Lint HTML with HTML Hint|
|[posthtml-tidy][tidy]|[![npm][tidy-badge]][tidy-npm]|Sanitize HTML with HTML Tidy|
|[posthtml-reporter][reporter]|[![npm][reporter-badge]][reporter-npm]|Messages Reporter (Errors)|


[options]: https://github.com/posthtml/posthtml-load-options
[options-badge]: https://img.shields.io/npm/v/posthtml-load-options.svg
[options-npm]: https://npmjs.com/package/posthtml-load-options

[plugins]: https://github.com/posthtml/posthtml-load-plugins
[plugins-badge]: https://img.shields.io/npm/v/posthtml-load-plugins.svg
[plugins-npm]: https://npmjs.com/package/posthtml-load-plugins

[config]: https://github.com/posthtml/posthtml-load-config
[config-badge]: https://img.shields.io/npm/v/posthtml-load-config.svg
[config-npm]: https://npmjs.com/package/posthtml-load-config

[tidy]: https://github.com/michael-ciniawsky/posthtml-tidy
[tidy-badge]: https://img.shields.io/npm/v/posthtml-tidy.svg
[tidy-npm]: https://npmjs.com/package/posthtml-tidy

[hint]: https://github.com/posthtml/posthtml-hint
[hint-badge]: https://img.shields.io/npm/v/posthtml-hint.svg
[hint-npm]: https://npmjs.com/package/posthtml-hint

[w3c]: https://github.com/posthtml/posthtml-w3c
[w3c-badge]: https://img.shields.io/npm/v/posthtml-w3c.svg
[w3c-npm]: https://npmjs.com/package/posthtml-w3c

[reporter]: https://github.com/posthtml/posthtml-reporter
[reporter-badge]: https://img.shields.io/npm/v/posthtml-reporter.svg
[reporter-npm]: https://npmjs.com/package/posthtml-reporter

### `Renderer`

```js
import jsx from 'posthtml-jsx'

posthtml().process(html, { render: jsx(options) }).then((result) => result.html)
```

|Name|Status|Description|
|:---|:-----|:----------|
|[posthtml-js][js]|[![npm][js-badge]][js-npm]|Render HTML to JS|
|[posthtml-jsx][jsx]|[![npm][jsx-badge]][jsx-npm]|Render HTML to JSX|


[js]: https://github.com/posthtml/posthtml-js
[js-badge]: https://img.shields.io/npm/v/posthtml-js.svg
[js-npm]: https://npmjs.com/package/posthtml-js

[jsx]: https://github.com/posthtml/posthtml-jsx
[jsx-badge]: https://img.shields.io/npm/v/posthtml-jsx.svg
[jsx-npm]: https://npmjs.com/package/posthtml-jsx

### `Middleware`

|Name|Status|Description|
|:---|:-----|:----------|
|[koa-posthtml][koa]|[![npm][koa-badge]][koa-npm]|Koa Middleware|
|[hapi-posthtml][hapi]|[![npm][hapi-badge]][hapi-npm]|Hapi Plugin|
|[express-posthtml][express]|[![npm][express-badge]][express-npm]|Express Middleware|
|[electron-posthtml][electron]|[![npm][electron-badge]][electron-npm]|Electron Plugin|
|[metalsmith-posthtml][metalsmith]|[![npm][metalsmith-badge]][metalsmith-npm]|Metalsmith Plugin|


[koa]: https://github.com/posthtml/koa-posthtml
[koa-badge]: https://img.shields.io/npm/v/koa-posthtml.svg
[koa-npm]: https://npmjs.com/package/koa-posthtml

[hapi]: https://github.com/posthtml/hapi-posthtml
[hapi-badge]: https://img.shields.io/npm/v/hapi-posthtml.svg
[hapi-npm]: https://npmjs.com/package/hapi-posthtml

[express]: https://github.com/posthtml/express-posthtml
[express-badge]: https://img.shields.io/npm/v/express-posthtml.svg
[express-npm]: https://npmjs.com/package/express-posthtml

[electron]: https://github.com/posthtml/electron-posthtml
[electron-badge]: https://img.shields.io/npm/v/electron-posthtml.svg
[electron-npm]: https://npmjs.com/package/electron-posthtml

[metalsmith]: https://github.com/posthtml/metalsmith-posthtml
[metalsmith-badge]: https://img.shields.io/npm/v/metalsmith-posthtml.svg
[metalsmith-npm]: https://npmjs.com/package/metalsmith-posthtml

<h2 align="center">Contributing</h2>

See [PostHTML Guidelines](https://github.com/posthtml/posthtml/tree/master/docs) and [CONTRIBUTING](CONTRIBUTING.md).

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
   <tr>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/1510217?v=3&s=150">
      <br />
      <a href="https://github.com/voischev">Ivan Voischev</a>
    </td>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/982072?v=3&s=150">
      <br />
      <a href="https://github.com/awinogradov">Anton Winogradov</a>
    </td>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/677518?v=3&s=150">
      <br />
      <a href="https://github.com/zxqfox">Alexej Yaroshevich</a>
    </td>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/1813468?v=3&s=150">
      <br />
      <a href="https://github.com/Yeti-or">Vasiliy</a>
    </td>
   </tr>
  <tbody>
</table>


[npm]: https://img.shields.io/npm/v/posthtml.svg
[npm-url]: https://npmjs.com/package/posthtml

[deps]: https://david-dm.org/posthtml/posthtml.svg
[deps-url]: https://david-dm.org/posthtml/posthtml

[tests]: https://travis-ci.org/posthtml/posthtml.svg
[tests-url]: https://travis-ci.org/posthtml/posthtml

[cover]: https://coveralls.io/repos/posthtml/posthtml/badge.svg
[cover-url]: https://coveralls.io/r/posthtml

[style]: https://img.shields.io/badge/code%20style-standard-yellow.svg
[style-url]: http://standardjs.com/

[chat]: https://badges.gitter.im/posthtml/posthtml.svg
[chat-url]: https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"
