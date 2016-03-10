# PostHTML API
## class
### .use()
**Arguments**: `{Function} plugin`

Adds a plugin into the flow.

#### Example

```js
var posthtml = require('posthtml');
var ph = posthtml()
    .use(function(tree) {
        return { tag: 'div', content: tree };
    });
```

### .process()
**Arguments**: `{String|PostHTMLTree} html[, {Object} options]`

Applies all plugins to the incoming `html` object.

**Returns**: `{{tree: PostHTMLTree, html: String}}`

(eventually) an Object with modified html and/or tree.

#### Example

```js
var ph = posthtml()
    .process('<div></div>'/*, { options }*/);
```

## Options
### `singleTags`
Array tags for extend default list single tags

**Default**: `[]`

_Options_ `{ singleTags: ['rect', 'custom'] }`

```html
...
<div>
    ...
    <rect>
    <custom>
</div>
```

### `closingSingleTag`
Option to specify version closing single tags. Accepts values: `default`, `slash`, `tag`.

**Default**: `default`

_Options_ `{ closingSingleTag: 'default' }`

```html
<singletag>
```

_Options_ `{ closingSingleTag: 'slash' }`

```html
<singletag />
```

_Options_ `{ closingSingleTag: 'tag' }`

```html
<singletag></singletag>
```

### `skipParse`
Skips input html parsing process.

**Default**: `null`

```js
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

**Default**: `null`

```js
posthtml()
    .use(function(tree) { tree.tag = 'section'; })
    .process('<div>foo</div>', { sync: true })
    .html; // <section>foo</section>
```

## class API
### .walk()
**Arguments**: `{function(PostHTMLNode|String): PostHTMLNode|String}`

Walk for all nodes in tree, run callback.

#### Example

```js
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
**Arguments**: `{Object|String|RegExp}, {function(PostHTMLNode|String): PostHTMLNode|String}`

Find subtree in tree, run callback.

#### Example

```js
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

```js
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
