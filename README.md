# PostHTML
[![npm version](https://badge.fury.io/js/posthtml.svg)](http://badge.fury.io/js/posthtml)
[![Build Status](https://travis-ci.org/posthtml/posthtml.svg?branch=master)](https://travis-ci.org/posthtml/posthtml?branch=master)
[![Coverage Status](https://coveralls.io/repos/posthtml/posthtml/badge.svg?branch=master)](https://coveralls.io/r/posthtml/posthtml?branch=master)

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
        require('posthtml-doctype')('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'),
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
        // <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
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

## Plugins

- [posthtml-bem](https://github.com/rajdee/posthtml-bem) — Support BEM naming in html structure
- [posthtml-textr](https://npmjs.com/package/posthtml-textr) — Modular typographic framework
- [posthtml-custom-elements](https://npmjs.com/package/posthtml-custom-elements) — Use custom elements now
- [posthtml-style-to-file](https://npmjs.com/package/posthtml-style-to-file) — Save HTML style nodes and attributes to CSS file
- [posthtml-doctype](https://npmjs.com/package/posthtml-doctype) — Extend html tags doctype
- [posthtml-include](https://github.com/posthtml/posthtml-include) — Include html file
- [posthtml-to-svg-tags](https://github.com/theprotein/posthtml-to-svg-tags) — Convert html tags to svg equals
- [posthtml-extend-attrs](https://github.com/theprotein/posthtml-extend-attrs) — Extend html tags attributes with custom data and attributes
- [posthtml-modular-css](https://github.com/admdh/posthtml-modular-css) — Makes css modular

## Ideas for plugins

- [retext](https://github.com/wooorm/retext) — Extensible system for analysing and manipulating natural language
- [posthtml-imports](https://github.com/posthtml/posthtml-imports) — Support W3C HTML imports
- [posthtml-style](https://github.com/posthtml/posthtml-style) — Include css file in HTML. Save \<style\>, style attrs to CSS file
- [beml](https://github.com/zenwalker/node-beml) — HTML preprocessor for BEM
- [mimic](http://peterchon.github.io/mimic/)

Something more? ;)


## PostHTML JSON tree example

__input HTML__
```html
<a class="animals" href="#">
    <span class="animals__cat" style="background: url(cat.png)">Cat</span>
</a>
```

__Tree in PostHTML (PostHTMLTree)__
```javascript
[{
    tag: 'a',
    attrs: {
        class: 'animals',
        href: '#'
    },
    content: [{
        tag: 'span',
        attrs: {
            class: 'animals__cat',
            style: 'background: url(cat.png)'
        },
        content: ['Cat']
    }]
}]
```

## Create PostHTML plugin

This is a simple function with a single argument

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
import { toTree } from 'posthtml/lib/api';
import request from 'request';

export default tree => {
    return new Promise(resolve => {
        tree.match({ tag: 'user-info' }, (node) => {
            request(`/api/user-info?${node.attrs.dataUserId}`, (err, resp, body) {
                if (!err && body) node.content = toTree(body);
                resolve(tree);
            });
        });
    });
};
```

## class PostHTML

### .parse ({String} html): {PostHTMLTree}
Parses HTML string into a PostHTMLTree object.

### .use ({Function} plugin): {PostHTML}
Adds a plugin into the flow.

### Example

```javascript
var posthtml = require('posthtml');
var ph = posthtml()
    .use(function(tree) {
        return { tag: 'div', content: tree };
    });
```

### .process ({String|PostHTMLTree} html, {Object} options): {{tree: PostHTMLTree, html: String}}
Applies all plugins to the incoming `html` object.

Returns (eventually) an Object with modified html and/or tree.

#### Example

```javascript
var ph = posthtml()
    .process('<div></div>'/*, { options }*/);
```

#### Options

##### `singleTags`
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


##### `closingSingleTag`
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


##### `skipParse`
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

##### `sync`
Try to run plugins synchronously. Throws if some plugins are async.

__Default__: `null`

```javascript
posthtml()
    .use(function(tree) { tree.tag = 'section'; })
    .process('<div>foo</div>', { sync: true })
    .html; // <section>foo</section>
```


## class API

### .walk ({function(PostHTMLNode): PostHTMLNode})
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

### .match ({Object|String}, {function(PostHTMLNode): PostHTMLNode|String})
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

### .matchClass ({String}, {function(PostHTMLNode): PostHTMLNode})
For each found of class run callback

#### Example

```javascript
tree.matchClass('class-for-delete', function(node) {
    // do something for node
    return ''; // delete this node in tree
});
```
