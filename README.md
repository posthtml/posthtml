[![npm][npm]][npm-1]
[![Build][build]][build-1]
[![Coverage][cover]][cover-1]
[![Chat][chat]][chat-1]

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

<img align="right" width="120" height="60" title="KoaJS" src="http://t2.gstatic.com/images?q=tbn:ANd9GcRfnGHcTYGyMNcicU4N3nzV-5Rta9s_e5LzSI2HBjKMsLHundtmqAlQ" />
### [Koa](http://koajs.com/)

##### [koa-posthtml](https://github.com/michael-ciniawsky/koa-posthtml)

<img align="right" width="120" height="75" title="HapiJS" src="https://worldvectorlogo.com/logos/hapi.svg" />
### [Hapi](https://hapijs.com)

##### [hapi-posthtml](https://github.com/michael-ciniawsky/hapi-posthtml)

<img align="right" width="125" height="50" title="ExpressJS" src="https://worldvectorlogo.com/logos/express-109.svg" />
### [Express](https://expressjs.com)

##### [express-posthtml](https://github.com/michael-ciniawsky/express-posthtml)

<img align="right" width="200" height="75" title="ElectronJS" src="https://worldvectorlogo.com/logos/electron-4.svg" />
### [Electron](https://electron.atom.io)

##### [electron-posthtml](https://github.com/michael-ciniawsky/electron-posthtml)

## Plugins
Take a look at the searchable [Plugins Catalog](http://maltsev.github.io/posthtml-plugins/) for PostHTML plugins.

|Plugin|Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|Description|
|:-----|:-----|:----------|
|[posthtml-bem][bem]| [![npm][bem-1]][bem-2] |Support BEM naming in html structure|
|[posthtml-postcss][css]|[![npm][css-1]][css-2]|Use [PostCSS][css-3] in HTML document|
|[posthtml-retext][text]|[![npm][text-1]][text-2]|Extensible system for analysing and manipulating natural language|
|[posthtml-custom-elements][elem]|[![npm][elem-1]][elem-2]| Use custom elements now |
|[posthtml-web-component][web]|[![npm][web-1]][web-2]|Web Component ServerSide Rending, Component as Service in Server|
|[posthtml-inline-css][in]|[![npm][in-1]][in-2]|CSS Inliner|
|[posthtml-style-to-file][style]|[![npm][style-1]][style-2]| Save HTML style nodes and attributes to CSS file|
|[posthtml-px2rem][px2rem]|[![npm][px2rem-1]][px2rem-2]|Change px to rem in HTML inline CSS|
|[posthtml-classes][classes]|[![npm][classes-1]][classes-2]|Get a list of classes from HTML|
|[posthtml-doctype][doctype]|[![npm][doctype-1]][doctype-2]|Extend html tags doctype|
|[posthtml-include][include]|[![npm][include-1]][include-2]|Include html file|
|[posthtml-to-svg-tags][svg]|[![npm][svg-1]][svg-2]|Convert html tags to svg equals|
|[posthtml-extend-attrs][attrs]|[![npm][attrs-1]][attrs-2]| Extend html tags attributes with custom data and attributes|
|[posthtml-modular-css][modular]|[![npm][modular-1]][modular-1]|Makes css modular|
|[posthtml-static-react][react]|[![npm][react-1]][react-2]| Render custom elements as static React components |
|[posthtml-head-elements][head]|[![npm][head-1]][head-2]|Store head elements (title, script, link, base and meta) in a JSON file and render them into the document during the build process|
|[posthtml-prefix-class][prefix]|[![npm][prefix-1]][prefix-2]|Prefix class names
|[posthtml-collect-inline-styles][collect]|[![npm][collect-1]][collect-2]|Collect inline styles and insert to head tag|
|[posthtml-transformer][transform]|[![npm][transform-1]][transform-2]|process HTML by directives in node attrs, such as inline scripts and styles, remove useless tags, concat scripts and styles etc.|
|[posthtml-inline-assets][assets]|[![npm][assets-1]][assets-2]|Inline external scripts, styles, and images in HTML|
|[posthtml-schemas][schemas]|[![npm][schemas-1]][schemas-2]|Add schema.org microdata to your markup super easy|
|[posthtml-extend][extend] |[![npm][extend-1]][extend-2]|Templates extending (Jade-like) |
|[posthtml-img-autosize][img]|[![npm][img-1]][img-2]|Auto setting the width and height of \<img\>|
|[posthtml-aria-tabs][aria]|[![npm][aria-1]][aria-2]|Write accessible tabs with minimal markup|
|[posthtml-lorem][lorem]|[![npm][lorem-1]][lorem-2]|Add lorem ipsum placeholder text to any document|
|[posthtml-md][md]|[![npm][md-1]][md-2]|Easily use context-sensitive markdown within HTML|
|[posthtml-alt-always][alt]|[![npm][alt-1]][alt-2]|Always add alt attribute for images that don't have it (accessibility reasons)|
|[posthtml-css-modules][modules]|[![npm][modules-1]][modules-2]|Use CSS modules in HTML|
|[posthtml-jade][jade]|[![npm][jade-1]][jade-2]|Jade templates/syntax support|
|[posthtml-exp][exp]|[![npm][exp-1]][exp-2]|Add template expressions to your HTML|
|[posthtml-tidy][tidy]|[![npm][tidy-1]][tidy-2]|Sanitize HTML with HTML Tidy on the fly|
|[posthtml-hint][hint]|[![npm][hint-1]][hint-2]|Lint HTML with HTML Hint|
|[posthtml-w3c][w3c]|[![npm][w3c-1]][w3c-2]|Validate HTML with W3C Validation|
|[posthtml-load-plugins][load]|[![npm][load-1]][load-2]|Auto-load Plugins for PostHTML|
|[posthtml-remove-attributes][remove]|[![npm][remove-1]][remove-2]|Remove attributes unconditionally or with content match|

## License
MIT

[npm]: https://badge.fury.io/js/posthtml.svg
[npm-1]: http://badge.fury.io/js/posthtml

[chat]: https://badges.gitter.im/posthtml/posthtml.svg
[chat-1]: https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"

[build]: https://travis-ci.org/posthtml/posthtml.svg?branch=master
[build-1]: https://travis-ci.org/posthtml/posthtml?branch=master

[cover]: https://coveralls.io/repos/posthtml/posthtml/badge.svg?branch=master
[cover-1]: https://coveralls.io/r/posthtml/posthtml?branch=master

[parser]: https://github.com/posthtml/posthtml-parser
[render]: https://github.com/posthtml/posthtml-render

[docs]: https://github.com/posthtml/posthtml/blob/master/docs

[bem]: https://github.com/rajdee/posthtml-bem
[bem-1]: https://badge.fury.io/js/posthtml-bem.svg
[bem-2]: https://badge.fury.io/js/posthtml-bem

[css]: https://github.com/posthtml/posthtml-postcss
[css-1]: https://badge.fury.io/js/posthtml-postcss.svg
[css-2]: https://badge.fury.io/js/posthtml-postcss
[css-3]: https://github.com/postcss/postcss

[text]: https://github.com/voischev/posthtml-retext
[text-1]: https://badge.fury.io/js/posthtml-retext.svg
[text-2]: https://badge.fury.io/js/posthtml-retext

[elem]: https://github.com/posthtml/posthtml-custom-elements
[elem-1]: https://badge.fury.io/js/posthtml-custom-elements.svg
[elem-2]: https://badge.fury.io/js/posthtml-custom-elements

[web]: https://github.com/island205/posthtml-web-component
[web-1]: https://badge.fury.io/js/posthtml-web-component.svg
[web-2]: https://badge.fury.io/js/posthtml-web-components

[in]: https://github.com/maltsev/posthtml-inline-css
[in-1]: https://badge.fury.io/js/posthtml-inline-css.svg
[in-2]: https://badge.fury.io/js/posthtml-inline-css

[style]: https://github.com/posthtml/posthtml-style-to-file
[style-1]: https://badge.fury.io/js/posthtml-style-to-file.svg
[style-2]: https://badge.fury.io/js/posthtml-style-to-file

[px2rem]: https://github.com/weixin/posthtml-px2rem
[px2rem-1]: https://badge.fury.io/js/posthtml-px2rem.svg
[px2rem-2]: https://badge.fury.io/js/posthtml-px2rem

[classes]: https://github.com/rajdee/posthtml-classes
[classes-1]: https://badge.fury.io/js/posthtml-classes.svg
[classes-2]: https://badge.fury.io/js/posthtml-classes

[doctype]: https://github.com/posthtml/posthtml-doctype
[doctype-1]: https://badge.fury.io/js/posthtml-doctype.svg
[doctype-2]: https://badge.fury.io/js/posthtml-doctype

[include]: https://github.com/posthtml/posthtml-include
[include-1]: https://badge.fury.io/js/posthtml-include.svg
[include-2]: https://badge.fury.io/js/posthtml-include

[svg]: https://github.com/theprotein/posthtml-to-svg-tags
[svg-1]: https://badge.fury.io/js/posthtml-to-svg-tags.svg
[svg-2]: https://badge.fury.io/js/posthtml-to-svg-tags

[attrs]: https://github.com/theprotein/posthtml-extend-attrs
[attrs-1]: https://badge.fury.io/js/posthtml-extend-attrs.svg
[attrs-2]: https://badge.fury.io/js/posthtml-extend-attrs

[modular]: https://github.com/admdh/posthtml-modular-css
[modular-1]: https://badge.fury.io/js/posthtml-modular-css.svg
[modular-2]: https://badge.fury.io/js/posthtml-modular-css

[react]: https://github.com/rasmusfl0e/posthtml-static-react
[react-1]: https://badge.fury.io/js/posthtml-static-react.svg
[react-2]: https://badge.fury.io/js/posthtml-static-react

[head]: https://github.com/TCotton/posthtml-head-elements
[head-1]: https://badge.fury.io/js/posthtml-head-elements.svg
[head-2]: https://badge.fury.io/js/posthtml-head-elements

[prefix]: https://github.com/stevenbenisek/posthtml-prefix-class
[prefix-1]: https://badge.fury.io/js/posthtml-prefix-class.svg
[prefix-2]: https://badge.fury.io/js/posthtml-prefix-class

[collect]: https://github.com/totora0155/posthtml-collect-inline-styles
[collect-1]: https://badge.fury.io/js/posthtml-collect-inline-styles.svg
[collect-2]: https://badge.fury.io/js/posthtml-collect-inline-styles

[transform]: https://github.com/flashlizi/posthtml-transformer
[transform-1]: https://badge.fury.io/js/posthtml-transformer.svg
[transform-2]: https://badge.fury.io/js/posthtml-transformer

[assets]: https://github.com/jonathantneal/posthtml-inline-assets
[assets-1]: https://badge.fury.io/js/posthtml-inline-assets.svg
[assets-2]: https://badge.fury.io/js/posthtml-inline-assets

[schemas]: https://github.com/jonathantneal/posthtml-schemas
[schemas-1]: https://badge.fury.io/js/posthtml-schemas.svg
[schemas-2]: https://badge.fury.io/js/posthtml-schemas

[extend]: https://github.com/maltsev/posthtml-extend
[extend-1]: https://badge.fury.io/js/posthtml-extend.svg
[extend-2]: https://badge.fury.io/js/posthtml-extend

[img]: https://github.com/maltsev/posthtml-img-autosize
[img-1]: https://badge.fury.io/js/posthtml-img-autosize.svg
[img-2]: https://badge.fury.io/js/posthtml-img-autosize

[aria]: https://github.com/jonathantneal/posthtml-aria-tabs
[aria-1]: https://badge.fury.io/js/posthtml-aria-tabs.svg
[aria-2]: https://badge.fury.io/js/posthtml-aria-tabs

[lorem]: https://github.com/jonathantneal/posthtml-lorem
[lorem-1]: https://badge.fury.io/js/posthtml-lorem.svg
[lorem-2]: https://badge.fury.io/js/posthtml-lorem

[md]: https://github.com/jonathantneal/posthtml-md
[md-1]: https://badge.fury.io/js/posthtml-md.svg
[md-2]: https://badge.fury.io/js/posthtml-md

[alt]: https://github.com/ismamz/posthtml-alt-always
[alt-1]: https://badge.fury.io/js/posthtml-alt-always.svg
[alt-2]: https://badge.fury.io/js/posthtml-alt-always

[modules]: https://github.com/maltsev/posthtml-css-modules
[modules-1]: https://badge.fury.io/js/posthtml-css-modules.svg
[modules-2]: https://badge.fury.io/js/posthtml-css-modules

[jade]: https://github.com/michael-ciniawsky/posthtml-jade
[jade-1]: https://badge.fury.io/js/posthtml-jade.svg
[jade-2]: https://badge.fury.io/js/posthtml-jade

[tidy]: https://github.com/michael-ciniawsky/posthtml-tidy
[tidy-1]: https://badge.fury.io/js/posthtml-tidy.svg
[tidy-2]: https://badge.fury.io/js/posthtml-tidy

[hint]: https://github.com//michael-ciniawsky/posthtml-hint
[hint-1]: https://badge.fury.io/js/posthtml-hint.svg
[hint-2]: https://badge.fury.io/js/posthtml-hint

[w3c]: https://github.com/michael-ciniawsky/posthtml-w3c
[w3c-1]: https://badge.fury.io/js/posthtml-w3c.svg
[w3c-2]: https://badge.fury.io/js/posthtml-w3c

[exp]: https://github.com/michael-ciniawsky/posthtml-exp
[exp-1]: https://badge.fury.io/js/posthtml-exp.svg
[exp-2]: https://badge.fury.io/js/posthtml-exp

[load]: https://github.com/michael-ciniawsky/posthtml-load-plugins
[load-1]: https://badge.fury.io/js/posthtml-load-plugins.svg
[load-2]: https://badge.fury.io/js/posthtml-load-plugins

[remove]: https://github.com/princed/posthtml-remove-attributes
[remove-1]: https://badge.fury.io/js/posthtml-remove-attributes.svg
[remove-2]: https://badge.fury.io/js/posthtml-remove-attributes
