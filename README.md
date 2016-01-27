# PostHTML

[![npm version](https://badge.fury.io/js/posthtml.svg)](http://badge.fury.io/js/posthtml)
[![Build Status](https://travis-ci.org/posthtml/posthtml.svg?branch=master)](https://travis-ci.org/posthtml/posthtml?branch=master)
[![Coverage Status](https://coveralls.io/repos/posthtml/posthtml/badge.svg?branch=master)](https://coveralls.io/r/posthtml/posthtml?branch=master)
[![Join the chat at https://gitter.im/posthtml/posthtml](https://badges.gitter.im/posthtml/posthtml.svg)](https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img align="right" width="220" height="200" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

PostHTML is a tool for transforming HTML/XML with JS plugins. PostHTML itself is very small. It includes only a HTML parser, a HTML node tree API and a node tree stringifier.

All HTML transformations are made by plugins. And these plugins are just small plain JS functions, which receive a HTML node tree, transform it, and return a modified tree.

## Usage

#### Install PostHTML
```
npm install --save-dev posthtml
```

__Simple example__

```javascript
var posthtml = require('posthtml');

var html = '<myComponent><myTitle>Super Title</myTitle><myText>Awesome Text</myText></myComponent>';

posthtml()
    .use(require('posthtml-custom-elements')())
    .process(html/*, options */)
    .then(function(result) {
        console.log(result.html);
        // <div class="myComponent"><div class="myTitle">Super Title</div><div class="myText">Awesome Text</div></div>
    });
```

__Сomplex example__

```javascript
var posthtml = require('posthtml');

var html = '<html><body><p class="wow">OMG</p></body></html>';

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
        // <svg xmlns="http://www.w3.org/2000/svg"><text class="wow" id="wow_id" fill="#4A83B4" fill-rule="evenodd" font-family="Verdana">OMG</text></svg>
    });
```

## Gulp plugin for PostHTML

#### Install [gulp-posthtml](https://www.npmjs.com/package/gulp-posthtml)

```
npm install --save-dev gulp-posthtml
```

```javascript
gulp.task('html', function() {
    var posthtml = require('gulp-posthtml');
    return gulp.src('src/**/*.html')
        .pipe(posthtml([ require('posthtml-custom-elements')() ]/*, options */))
        .pipe(gulp.dest('build/'));
});
```

Check [project-stub](https://github.com/posthtml/project-stub) example with Gulp

## Grunt plugin for PostHTML

#### Install [grunt-posthtml](https://www.npmjs.com/package/grunt-posthtml)

```
npm install --save-dev grunt-posthtml
```

```javascript
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

## PostHTML with Jade engine in Expressjs

Also it's work with other view engine. Callback in `app.engine` is called by `res.render()` to render the template code.
```javascript
app.engine('jade', function (path, options, callback) {
    // PostHTML plugins
    var plugins = [
        require('posthtml-bem')(),
        require('posthtml-textr')({ locale: 'ru'}, [
            require('typographic-ellipses'),
            require('typographic-single-spaces'),
            require('typographic-quotes')
        ])
    ];

    var html = require('jade').renderFile(path, options);

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

## CLI
- [posthtml-cli](https://github.com/GitScrum/posthtml-cli)

## Plugins

Take a look at the [searchable catalog](http://maltsev.github.io/posthtml-plugins/) of the PostHTML plugins. 

- [posthtml-bem](https://github.com/rajdee/posthtml-bem) — Support BEM naming in html structure
- [posthtml-postcss](https://github.com/posthtml/posthtml-postcss) — Use [PostCSS](https://github.com/postcss/postcss) in HTML document
- [posthtml-retext](https://github.com/voischev/posthtml-retext) — Extensible system for analysing and manipulating natural language
- [posthtml-textr](https://github.com/voischev/posthtml-textr) — Modular typographic framework
- [posthtml-custom-elements](https://github.com/posthtml/posthtml-custom-elements) — Use custom elements now
- [posthtml-web-component](https://github.com/island205/posthtml-web-component) — Web Component ServerSide Rending, Component as Service in Server
- [posthtml-inline-css](https://github.com/maltsev/posthtml-inline-css) — CSS Inliner
- [posthtml-style-to-file](https://github.com/posthtml/posthtml-style-to-file) — Save HTML style nodes and attributes to CSS file
- [posthtml-px2rem](https://github.com/weixin/posthtml-px2rem) — Change px to rem in HTML inline CSS
- [posthtml-classes](https://github.com/rajdee/posthtml-classes) — Get a list of classes from HTML
- [posthtml-doctype](https://github.com/posthtml/posthtml-doctype) — Extend html tags doctype
- [posthtml-include](https://github.com/posthtml/posthtml-include) — Include html file
- [posthtml-to-svg-tags](https://github.com/theprotein/posthtml-to-svg-tags) — Convert html tags to svg equals
- [posthtml-extend-attrs](https://github.com/theprotein/posthtml-extend-attrs) — Extend html tags attributes with custom data and attributes
- [posthtml-modular-css](https://github.com/admdh/posthtml-modular-css) — Makes css modular
- [posthtml-static-react](https://github.com/rasmusfl0e/posthtml-static-react) — Render custom elements as static React components
- [posthtml-head-elements](https://github.com/TCotton/posthtml-head-elements) — Store head elements (title, script, link, base and meta) in a JSON file and render them into the document during the build process
- [posthtml-prefix-class](https://github.com/stevenbenisek/posthtml-prefix-class) — Prefix class names
- [posthtml-collect-inline-styles](https://github.com/totora0155/posthtml-collect-inline-styles) — Collect inline styles and insert to head tag
- [posthtml-transformer](https://github.com/flashlizi/posthtml-transformer) – process HTML by directives in node attrs, such as inline scripts and styles, remove useless tags, concat scripts and styles etc.
- [posthtml-inline-assets](https://github.com/jonathantneal/posthtml-inline-assets) – Inline external scripts, styles, and images in HTML
- [posthtml-schemas](https://github.com/jonathantneal/posthtml-schemas) – Add schema.org microdata to your markup super easy
- [posthtml-extend](https://github.com/maltsev/posthtml-extend) — Templates extending (Jade-like)
- [posthtml-img-autosize](https://github.com/maltsev/posthtml-img-autosize) — Auto setting the width and height of \<img\>
- [posthtml-aria-tabs](https://github.com/jonathantneal/posthtml-aria-tabs) — Write accessible tabs with minimal markup
- [posthtml-lorem](https://github.com/jonathantneal/posthtml-lorem) — Add lorem ipsum placeholder text to any document
- [posthtml-md](https://github.com/jonathantneal/posthtml-md) — Easily use context-sensitive markdown within HTML
- [posthtml-alt-always](https://github.com/ismamz/posthtml-alt-always) — Always add alt attribute for images that don't have it (accessibility reasons)

## Ideas for plugins

- [posthtml-imports](https://github.com/posthtml/posthtml-imports) — Support W3C HTML imports
- [posthtml-style](https://github.com/posthtml/posthtml-style) — Include css file in HTML. Save \<style\>, style attrs to CSS file
- [beml](https://github.com/zenwalker/node-beml) — HTML preprocessor for BEM
- [mimic](http://peterchon.github.io/mimic/)

Something more? ;)

## Helpers

- [posthtml-match-helper](https://github.com/rasmusfl0e/posthtml-match-helper) - Expand CSS selectors into PostHTML matcher objects.
- [posthtml-attrs-parser](https://github.com/maltsev/posthtml-attrs-parser) - Better API to work with PostHTML attrs.
- [posthtml-plugin-boilerplate](https://github.com/jonathantneal/posthtml-plugin-boilerplate) – PostHTML Plugin Boilerplate

## Dependency

- [posthtml-parser](https://github.com/posthtml/posthtml-parser) — Parser HTML/XML to PostHTMLTree
- [posthtml-render](https://github.com/posthtml/posthtml-render) — Render PostHTMLTree to HTML/XML

## PostHTML JSON tree example

#### input HTML
```html
<a class="animals" href="#">
    <span class="animals__cat" style="background: url(cat.png)">Cat</span>
</a>
```

#### Tree in PostHTML (PostHTMLTree)
```javascript
[{
    tag: 'a',
    attrs: {
        class: 'animals',
        href: '#'
    },
    content: [
        '\n    ',
            {
            tag: 'span',
            attrs: {
                class: 'animals__cat',
                style: 'background: url(cat.png)'
            },
            content: ['Cat']
        },
        '\n'
    ]
}]
```

## Create PostHTML plugin

This is a simple function with a single argument.

> Use [posthtml-plugin-boilerplate](https://github.com/jonathantneal/posthtml-plugin-boilerplate) boilerplate for create new plugin.

### Synchronous plugin example

```javascript
module.exports = function pluginName(tree) {
    // do something for tree
    tree.match({ tag: 'img' }, function(node) {
        node = Object.assign(node, { attrs: { class: 'img-wrapped' } }});
        return {
            tag: 'span',
            attrs: { class: 'img-wrapper' },
            content: node
        }
    });
};
```

### Classic asynchronous plugin example

```javascript
var request = request('request');
module.exports = function pluginName(tree, cb) {
    var tasks = 0;
    tree.match({ tag: 'a' }, function(node) {
        // skip local anchors
        if (!/^(https?:)?\/\//.test(node.attrs.href)) {
            return node;
        }
        request.head(node.attrs.href, function (err, resp) {
            if (err) return done();
            if (resp.statusCode >= 400) {
                node.attrs.class += ' ' + 'Erroric';
            }
            if (resp.headers.contentType) {
                node.attrs.class += ' content-type_' + resp.headers.contentType;
            }
            done();
        });
        tasks += 1;
        return node;
    });
    function done() {
        tasks -= 1;
        if (!tasks) cb(null, tree);
    }
};
```

### Promised asynchronous plugin example

```javascript
import parser from 'posthtml-parser';
import request from 'request';

export default tree => {
    return new Promise(resolve => {
        tree.match({ tag: 'user-info' }, (node) => {
            request(`/api/user-info?${node.attrs.dataUserId}`, (err, resp, body) {
                if (!err && body) node.content = parser(body);
                resolve(tree);
            });
        });
    });
};
```

## class PostHTML

### .use()

__Arguments__: `{Function} plugin`

Adds a plugin into the flow.

#### Example

```javascript
var posthtml = require('posthtml');
var ph = posthtml()
    .use(function(tree) {
        return { tag: 'div', content: tree };
    });
```

### .process()

__Arguments__: `{String|PostHTMLTree} html[, {Object} options]`

Applies all plugins to the incoming `html` object.

__Returns__: `{{tree: PostHTMLTree, html: String}}`

(eventually) an Object with modified html and/or tree.

#### Example

```javascript
var ph = posthtml()
    .process('<div></div>'/*, { options }*/);
```

## Options

### `singleTags`
Array tags for extend default list single tags

__Default__: `[]`

*Options* `{ singleTags: ['rect', 'custom'] }`

```html
...
<div>
    ...
    <rect>
    <custom>
</div>
```


### `closingSingleTag`
Option to specify version closing single tags.
Accepts values: `default`, `slash`, `tag`.

__Default__: `default`

*Options* `{ closingSingleTag: 'default' }`

```html
<singletag>
```

*Options* `{ closingSingleTag: 'slash' }`

```html
<singletag />
```

*Options* `{ closingSingleTag: 'tag' }`

```html
<singletag></singletag>
```


### `skipParse`
Skips input html parsing process.

__Default__: `null`

```javascript
posthtml()
    .use(function(tree) { tree.tag = 'section'; })
    .process({ tag: 'div' }, { skipParse: true })
    .then(function (result) {
        result.tree; // { tag: 'section' }
        result.html; // <section></section>
    });
```

### `sync`
Try to run plugins synchronously. Throws if some plugins are async.

__Default__: `null`

```javascript
posthtml()
    .use(function(tree) { tree.tag = 'section'; })
    .process('<div>foo</div>', { sync: true })
    .html; // <section>foo</section>
```


## class API

### .walk()

__Arguments__: `{function(PostHTMLNode|String): PostHTMLNode|String}`

Walk for all nodes in tree, run callback.

#### Example

```javascript
tree.walk(function(node) {
    let classes = node.attrs && node.attrs.class.split(' ') || [];
    if(classes.includes(className)) {
        // do something for node
        return node;
    }
    return node;
});
```

### .match()

__Arguments__: `{Object|String|RegExp}, {function(PostHTMLNode|String): PostHTMLNode|String}`

Find subtree in tree, run callback.

#### Example

```javascript
tree.match({ tag: 'custom-tag' }, function(node) {
    // do something for node
    return Object.assign(node, {
        tag: 'div',
        attrs: { class: node.tag }
    });
});
```

Support Array matchers

#### Example

```javascript
tree.match([{ tag: 'b' }, { tag: 'strong' }], function(node) {
    var style = 'font-weight: bold;';
    node.tag = 'span';
    node.attrs ? (
        node.attrs.style ? (
            node.attrs.style += style
        ) : node.attrs.style = style;
    ) : node.attrs = { style: style };
    return node
});
```

## License

MIT
