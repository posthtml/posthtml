# PostHTML
[![npm version](https://badge.fury.io/js/posthtml.svg)](http://badge.fury.io/js/posthtml)
[![Build Status](https://travis-ci.org/posthtml/posthtml.svg)](https://travis-ci.org/posthtml/posthtml)
[![Coverage Status](https://coveralls.io/repos/posthtml/posthtml/badge.svg)](https://coveralls.io/r/posthtml/posthtml)

PostHTML is a tool for transforming HTML with JS plugins. PostHTML itself is very small. It includes only a HTML parser, a HTML node tree API and a node tree stringifier.

All HTML transformations are made by plugins. And these plugins are just small plain JS functions, which receive a HTML node tree, transform it, and return a modified tree.

## Usage

``` javascript
var posthtml = require('posthtml'),
    fs = require('fs');

var html = '<div class="wow">OMG</div>';

posthtml([ require('posthtml-to-svg-tags')(), require('posthtml-extend-attrs')() ])
    .process(html)
    .then(function(result) {
        fs.writeFileSync('index.html', result);
    });
```

## Plugins

- [posthtml-to-svg-tags](https://github.com/theprotein/posthtml-to-svg-tags) - convert html tags to svg equals
- [posthtml-extend-attrs](https://github.com/theprotein/posthtml-extend-attrs) - extend html tags attributes with custom data and attributes
