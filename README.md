# PostHTML
[![npm version](https://badge.fury.io/js/posthtml.svg)](http://badge.fury.io/js/posthtml)
[![Build Status](https://travis-ci.org/posthtml/posthtml.svg)](https://travis-ci.org/posthtml/posthtml)
[![Coverage Status](https://coveralls.io/repos/posthtml/posthtml/badge.svg?branch=master)](https://coveralls.io/r/posthtml/posthtml?branch=master)

PostHTML is a tool for transforming HTML with JS plugins. PostHTML itself is very small. It includes only a HTML parser, a HTML node tree API and a node tree stringifier.

All HTML transformations are made by plugins. And these plugins are just small plain JS functions, which receive a HTML node tree, transform it, and return a modified tree.

## Usage

``` javascript
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
                    'fill-rule': 'evenodd'
                    'font-family': 'Verdana'
                }
            }
        })
    ])
    .process(html)
    .then(function(result) {
        console.log(result.html);
        // <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        // <svg xmlns="http://www.w3.org/2000/svg"><text class="wow" id="wow_id" fill="#4A83B4" fill-rule="evenodd" font-family="Verdana">OMG</text></svg>
    });
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
{
    tag: 'a',
    attrs: {
        class: 'animals',
        href: '#'
    },
    content: {
        tag: 'span',
        attrs: {
            class: 'animals__cat',
            style: 'background: url(cat.png)'
        },
        content: 'Cat'
    }
}
```

## Plugins

- [posthtml-doctype](https://github.com/posthtml/posthtml-doctype) — extend html tags doctype
- [posthtml-to-svg-tags](https://github.com/theprotein/posthtml-to-svg-tags) — convert html tags to svg equals
- [posthtml-extend-attrs](https://github.com/theprotein/posthtml-extend-attrs) — extend html tags attributes with custom data and attributes

## Ideas for plugins

- [posthtml-classes](https://github.com/posthtml/posthtml-classes) — Configure node in classes
- [textr](https://github.com/shuvalov-anton/textr) — Typographic framework
- [beml](https://github.com/zenwalker/node-beml) — HTML preprocessor for BEM

Something more? ;)
