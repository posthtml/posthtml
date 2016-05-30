[![npm][npm]][npm-badge]
[![Build][build]][build-badge]
[![Coverage][cover]][cover-badge]
[![Chat][chat]][chat-badge]

# PostHTML <img align="right" width="220" height="200" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

PostHTML is a tool for transforming HTML/XML with JS plugins. PostHTML itself is very small. It includes only a HTML parser, a HTML node tree API and a node tree stringifier.

All HTML transformations are made by plugins. And these plugins are just small plain JS functions, which receive a HTML node tree, transform it, and return a modified tree.

For more detailed information about PostHTML in general take a look at the [docs][docs].

## Dependencies
- [posthtml-parser][parser] — Parser HTML/XML to PostHTMLTree
- [posthtml-render][render] — Render PostHTMLTree to HTML/XML

## Usage

```
npm i -D posthtml
```
<img align="right" width="91" height="80" title="NodeJS" src="https://worldvectorlogo.com/logos/nodejs-icon.svg">
### API

**Simple example**

```js
const posthtml = require('posthtml');

let html = `
    <myComponent>
      <myTitle>Super Title</myTitle>
      <myText>Awesome Text</myText>
    </myComponent>`;

posthtml()
    .use(require('posthtml-custom-elements')())
    .process(html/*, options */)
    .then(function(result) {
        console.log(result.html);
        // <div class="myComponent">
        //  <div class="myTitle">Super Title</div>
        //  <div class="myText">Awesome Text</div>
        // </div>
    });
```

**Сomplex example**

```js
const posthtml = require('posthtml');

let html = '<html><body><p class="wow">OMG</p></body></html>';

posthtml([
        require('posthtml-to-svg-tags')(),
        require('posthtml-extend-attrs')({
            attrsTree: {
                '.wow' : {
                    id: 'wow_id',
                    fill: '#4A83B4',
                    'fill-rule': 'evenodd',
                    'font-family': 'Verdana'
                }
            }
        })
    ])
    .process(html/*, options */)
    .then(function(result) {
        console.log(result.html);
        // <svg xmlns="http://www.w3.org/2000/svg">
        //  <text
        //    class="wow"
        //    id="wow_id" fill="#4A83B4"
        //    fill-rule="evenodd" font-family="Verdana">
        //     OMG
        //  </text>
        // </svg>
    });
```

<img align="right"  width="100" height="90" title="npm" src="https://worldvectorlogo.com/logos/npm.svg" />
## CLI

### Install [posthtml-cli](https://github.com/GitScrum/posthtml-cli)

```bash
npm i posthtml-cli
```

```bash
posthtml -o output.html -i input.html -c config.json
```
or

```json
"scripts": {
  "html": "echo '=> Building HTML' && posthtml -o output.html -i input.html -c config.json"
}
```

```bash
npm run html
```
<img align="right" width="80" height="80" title="GulpJS" src="https://worldvectorlogo.com/logos/gulp.svg" />
## Gulp

### Install [gulp-posthtml](https://www.npmjs.com/package/gulp-posthtml)

```bash
npm i -D gulp-posthtml
```

```js
gulp.task('html', function() {
    let posthtml = require('gulp-posthtml');
    return gulp.src('src/**/*.html')
        .pipe(posthtml([ require('posthtml-custom-elements')() ]/*, options */))
        .pipe(gulp.dest('build/'));
});
```

Check [project-stub](https://github.com/posthtml/project-stub) example with Gulp

<img align="right" width="90" height="80" title="GruntJS" src="https://worldvectorlogo.com/logos/grunt.svg" />
## Grunt

### Install [grunt-posthtml](https://www.npmjs.com/package/grunt-posthtml)

```bash
npm i -D grunt-posthtml
```

```js
posthtml: {
    options: {
        use: [
            require('posthtml-head-elements')({
                headElements: 'test/config/head.json'
            }),
            require('posthtml-doctype')({
                doctype: 'HTML 5'
            }),
            require('posthtml-include')({
                encoding: 'utf-8'
            })
        ]
    },
    build: {
        files: [{
            expand: true,
            dot: true,
            cwd: 'test/html/',
            src: ['*.html'],
            dest: 'test/tmp/'
        }]
    }
}
```
<img align="right" width="90" height="90" title="Webpack" src="https://worldvectorlogo.com/logos/webpack.svg" />
## Webpack

### Install [posthtml-loader](https://www.npmjs.com/package/posthtml-loader)

```bash
npm i -D posthtml-loader
```
```js

const bem = require('posthtml-bem')()
const each = require('posthtml-each')()

module.exports = {
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html!posthtml'
      }
    ]
  }
  posthtml: function () {
    return {
      defaults: [ bem, each ]
    }
  }
}
```
with custom package

```js
const bem = require('posthtml-bem')()
const each = require('posthtml-each')()
const include = require('posthtml-include')()

module.exports = {
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html!posthtml?pack=html'
      }
    ]
  }
  posthtml: function () {
    return {
      defaults: [ bem, each ],
      html: [ bem, each, include ]
    }
  }
}
```
## PostHTML with Jade engine in Express
Also it's work with other view engine. Callback in `app.engine` is called by `res.render()` to render the template code.

```js
app.engine('jade', function (path, options, callback) {
    // PostHTML plugins
    let plugins = [
        require('posthtml-bem')(),
        require('posthtml-textr')({ locale: 'ru'}, [
            require('typographic-ellipses'),
            require('typographic-single-spaces'),
            require('typographic-quotes')
        ])
    ];

    let html = require('jade').renderFile(path, options);

    posthtml(plugins)
        .process(html)
        .then(function (result) {
            if (typeof callback === 'function') {
                var res;
                try {
                    res = result.html;
                } catch (ex) {
                    return callback(ex);
                }
                return callback(null, res);
            }
        });
})
app.set('view engine', 'jade');
```

## Middleware

<img align="right" height="56" title="KoaJS" src="http://t2.gstatic.com/images?q=tbn:ANd9GcRfnGHcTYGyMNcicU4N3nzV-5Rta9s_e5LzSI2HBjKMsLHundtmqAlQ" />

### [Koa](http://koajs.com/)

##### [koa-posthtml](https://github.com/michael-ciniawsky/koa-posthtml)

<img align="right" height="56" title="HapiJS" src="https://worldvectorlogo.com/logos/hapi.svg" />

### [Hapi](https://hapijs.com)

##### [hapi-posthtml](https://github.com/michael-ciniawsky/hapi-posthtml)

<img align="right" height="28" title="ExpressJS" src="https://worldvectorlogo.com/logos/express-109.svg" />

### [Express](https://expressjs.com)

##### [express-posthtml](https://github.com/michael-ciniawsky/express-posthtml)

<img align="right" height="28" title="ElectronJS" src="https://worldvectorlogo.com/logos/electron-4.svg" />

### [Electron](https://electron.atom.io)

##### [electron-posthtml](https://github.com/michael-ciniawsky/electron-posthtml)

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
