# PostHTML
[![npm version](https://badge.fury.io/js/posthtml.svg)](http://badge.fury.io/js/posthtml)
[![Build Status](https://travis-ci.org/posthtml/posthtml.svg?branch=master)](https://travis-ci.org/posthtml/posthtml)
[![Coverage Status](https://coveralls.io/repos/posthtml/posthtml/badge.svg?branch=master)](https://coveralls.io/r/posthtml/posthtml?branch=master)

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
gulp.task('html', function () {
    var posthtml = require('gulp-posthtml');
    return gulp.src('src/**/*.html')
        .pipe( posthtml([ require('posthtml-custom-elements')() ]/*, options */) )
        .pipe( gulp.dest('build/') );
});
```

## Options

#### `singleTags`
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


#### `closingSingleTag`
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


## PostHTML JSON tree example

__input HTML__
```html
<a class="animals" href="#">
    <span class="animals__cat" style="background: url(cat.png)">Cat</span>
</a>
```

__Tree in PostHTML__
```js
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

### Example plugin

```javascript
module.exports = function (tree) {

    // do something for tree
    tree.match({ tag: 'img' }, function(node) {
        node = Object.assign(node, { attrs: { class: 'img-wrapped' } }});
        return {
            tag: 'span',
            attrs: { class: 'img-wrapper' },
            content: node
        }
    });

    return tree;
}
```

## API

### Walk
Walk for all nodes in tree, run callback.

#### Example use
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

### Match
Find subtree in tree, run callback.

#### Example use
```javascript
tree.match({ tag: 'custom-tag' }, function(node) {
    // do something for node
    var tag = node.tag;
    node = Object.assign(node, { tag: 'div', attrs: { class: tag } }});
    return node
});
```

### matchClass
For each found of class run callback

#### Example use
```javascript
tree.matchClass('class-for-delete', function(node) {
    // do something for node
    return ''; // delete this node in tree
});
```


## Plugins

- [posthtml-textr](https://npmjs.com/package/posthtml-textr) — Modular typographic framework
- [posthtml-custom-elements](https://npmjs.com/package/posthtml-custom-elements) — Use custom elements now
- [posthtml-style-to-file](https://npmjs.com/package/posthtml-style-to-file) — Save HTML style nodes and attributes to CSS file
- [posthtml-doctype](https://npmjs.com/package/posthtml-doctype) — Extend html tags doctype
- [posthtml-to-svg-tags](https://github.com/theprotein/posthtml-to-svg-tags) — Convert html tags to svg equals
- [posthtml-extend-attrs](https://github.com/theprotein/posthtml-extend-attrs) — Extend html tags attributes with custom data and attributes
- [posthtml-modular-css](https://github.com/admdh/posthtml-modular-css) — Makes css modular

## Ideas for plugins

- [retext](https://github.com/wooorm/retext) — Extensible system for analysing and manipulating natural language
- [posthtml-include](https://github.com/posthtml/posthtml-include) — Include html file
- [posthtml-imports](https://github.com/posthtml/posthtml-imports) — Support W3C HTML imports
- [posthtml-style](https://github.com/posthtml/posthtml-style) — Include css file in HTML. Save \<style\>, style attrs to CSS file
- [posthtml-classes](https://github.com/posthtml/posthtml-classes) — Configure node in classes
- [beml](https://github.com/zenwalker/node-beml) — HTML preprocessor for BEM
- [mimic](http://peterchon.github.io/mimic/)

Something more? ;)
