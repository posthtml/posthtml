# PostHTML <img align="right" width="220" height="200" alt="PostHTML" src="https://raw.githubusercontent.com/posthtml/posthtml/master/logo.svg">

PostHTML is a tool for transforming HTML/XML with JS plugins. PostHTML itself is very small. It includes only a HTML parser, a HTML node tree API and a node tree stringifier.

All HTML transformations are made by plugins. And these plugins are just small plain JS functions, which receive a HTML node tree, transform it, and return a modified tree.

See the [documentation](https://github.com/posthtml/posthtml/tree/master/docs) for the processor API, tree format and plugin guides.

For usage questions, visit [Discussions](https://github.com/posthtml/posthtml/discussions). Report bugs and propose features through [Issues](https://github.com/posthtml/posthtml/issues/new/choose).

### Dependencies

| Name | Description |
|:----:|:-----------:|
|[posthtml-parser](https://github.com/posthtml/posthtml-parser)| Parser HTML/XML to PostHTMLTree |
|[posthtml-render](https://github.com/posthtml/posthtml-render)| Render PostHTMLTree to HTML/XML |

## Install

Requires Node.js `^20.19.0 || >=22.12.0`, matching the synchronous loading requirements of `posthtml-parser` and its `htmlparser2` backend.

```bash
npm i -D posthtml
```

## Usage

### API

The examples below use ES modules. Save them as `.mjs` files or set `"type": "module"` in your project's `package.json`, and install the plugins used in each example.

**Sync**

```js
import posthtml from 'posthtml'

const customElements = () => (tree) => {
  tree.match({ tag: /^(component|title|text)$/ }, (node) => ({
    tag: 'div',
    attrs: { class: node.tag },
    content: node.content
  }))
}

const html = `
  <component>
    <title>Super Title</title>
    <text>Awesome Text</text>
  </component>
`

const result = posthtml()
  .use(customElements())
  .process(html, { sync: true })
  .html

console.log(result)
```

```html
<div class="component">
  <div class="title">Super Title</div>
  <div class="text">Awesome Text</div>
</div>
```

> :warning: Async Plugins can't be used in sync mode and will throw an Error. It's recommended to use PostHTML asynchronously whenever possible.

**Async**

```js
import posthtml from 'posthtml'
import include from 'posthtml-include'
import expressions from 'posthtml-expressions'

const html = `
  <include src="header.html"></include>
  <h1>{{ title }}</h1>
`

posthtml([
  include({ root: './src' }),
  expressions({ locals: { title: 'Hello PostHTML' } })
])
  .process(html/*, options */)
  .then((result) => console.log(result.html))
```

```html
<header>Site header</header>
<h1>Hello PostHTML</h1>
```

**Directives**

```js
import posthtml from 'posthtml'
import expressions from 'posthtml-expressions'

const php = `
  <h1>{{ title }}</h1>
  <p><?php echo $article; ?></p>
`

posthtml([expressions({ locals: { title: 'Hello PostHTML' } })])
  .process(php, {
    directives: [
      { name: '?php', start: '<', end: '>' }
    ]
  })
  .then((result) => console.log(result.html))
```

```html
<h1>Hello PostHTML</h1>
<p><?php echo $article; ?></p>
```

### [CLI](https://npmjs.com/package/posthtml-cli)

```bash
npm i posthtml-cli
```

```json
"scripts": {
  "posthtml": "posthtml -o output.html -i input.html -c config.json"
}
```

```bash
npm run posthtml
```

### [Gulp](https://gulpjs.com)

```bash
npm i -D gulp-posthtml
```

```js
import gulp from 'gulp'
import posthtml from 'gulp-posthtml'
import include from 'posthtml-include'

const { task, src, dest } = gulp

task('html', () => {
  const plugins = [include({ root: 'src' })]
  const options = {}

  return src('src/**/*.html')
    .pipe(posthtml(plugins, options))
    .pipe(dest('build/'))
})
```

### [Webpack](https://webpack.js.org)

```bash
npm i -D html-loader posthtml-loader
```

**webpack.config.js**

```js
import include from 'posthtml-include'

export default {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          'html-loader',
          {
            loader: 'posthtml-loader',
            options: {
              plugins: [include({ root: 'src' })]
            }
          }
        ]
      }
    ]
  }
}
```

## Custom parser and renderer

PostHTML uses [posthtml-parser](https://github.com/posthtml/posthtml-parser) and [posthtml-render](https://github.com/posthtml/posthtml-render) by default. Pass `parser` or `render` in the [process options](docs/core.md) to replace them.

## Plugins

In case you want to develop your own plugin, we recommend using [posthtml-plugin-starter][plugin] to get started.

See the [plugins catalog](https://posthtml.github.io/posthtml-plugins/).

[plugin]: https://github.com/posthtml/posthtml-plugin-starter

## Contributing

Use Node.js 24 from `.nvmrc` and run `npm run check`. See the [contributor guide](https://github.com/posthtml/posthtml/blob/master/.github/contributing.md) for commands and releases, and [AGENTS.md](https://github.com/posthtml/posthtml/blob/master/AGENTS.md) for coordinated work on PostHTML, its parser and renderer.

## Maintainers

<table>
  <tbody>
   <tr>
    <td align="center">
      <img width="150" height="150"
      src="https://avatars0.githubusercontent.com/u/2789192?s=460&v=4">
      <br />
      <a href="https://github.com/scrum">Ivan Demidov</a>
    </td>
    <td align="center">
      <img width="150" height="150"
      src="https://avatars.githubusercontent.com/u/1510217?v=3&s=150">
      <br />
      <a href="https://github.com/voischev">Ivan Voischev</a>
    </td>
   </tr>
  </tbody>
</table>

## Contributors

[View all contributors on GitHub](https://github.com/posthtml/posthtml/graphs/contributors).

[chat]: https://badges.gitter.im/posthtml/PostHTML.svg
[chat-url]: https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"
