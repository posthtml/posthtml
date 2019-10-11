# Plugins

A PostHTML plugin is a simple function with a single argument.

> Use [posthtml-plugin-boilerplate][plugin-boilerplate] boilerplate for create new plugin.

## Synchronous

```js
export default function postHTMLPluginName (tree) {
    // do something for tree
  tree.match({ tag: 'img' }, (node) => {
    node = Object.assign(node, { attrs: { class: 'img-wrapped' } })

    return {
      tag: 'span',
      attrs: { class: 'img-wrapper' },
      content: node
    }
  })
}
```

## Asynchronous

```js
import request from 'request'

export default function postHTMLPluginName (tree, cb) {
  let tasks = 0

  tree.match({ tag: 'a' }, (node) => {
    // skip local anchors
    if (!/^(https?:)?\/\//.test(node.attrs.href)) {
      return node
    }

    request.head(node.attrs.href, (err, resp) => {
      if (err) return done()

      if (resp.statusCode >= 400) {
        node.attrs.class += ' ' + 'Erroric'
      }

      if (resp.headers.contentType) {
        node.attrs.class += ' content-type_' + resp.headers.contentType
      }

        done()
    })

    tasks += 1

    return node
  })

  function done() {
    tasks -= 1

    if (!tasks) cb(null, tree)
  }
}
```

## Asynchronous with Promises

```js
import request from 'request'
import parser from 'posthtml-parser'

export default (tree) => {
  return new Promise((resolve) => {
    tree.match({ tag: 'user-info' }, (node) => {
      request(`/api/user-info?${node.attrs.dataUserId}`, (err, resp, body) => {
        if (!err && body) node.content = parser(body)
          resolve(tree)
      })
    })
  })
}
```

## Messages
> Tree messages to store and pass metadata between plugins

```js
export default function plugin (options = {}) {
  return function (tree) {
     tree.messages.push({
       type: 'dependency',
       file: 'path/to/dependency.html',
       from: tree.options.from
     })

     return tree
  }
}
```

## parser
> Tree method parsing string inside plugins.

```js
export default function plugin (options = {}) {
  return function (tree) {
     tree.match({ tag: 'include' }, function(node) {
        node.tag = false;
        node.content = tree.parser(fs.readFileSync(node.attr.src))
        return node
      })
      return tree
  }
}
```

## render
> Tree method rendering tree to string inside plugins.

```js
export default function plugin (options = {}) {
    return function (tree) {
      var outherTree = ['\n', {tag: 'div', content: ['1']}, '\n\t', {tag: 'div', content: ['2']}, '\n'];
      var htmlWitchoutSpaceless = tree.render(outherTree).replace(/[\n|\t]/g, '');
      return tree.parser(htmlWitchoutSpaceless)
    }
}
```

[plugin-boilerplate]: https://github.com/posthtml/posthtml-plugin-boilerplate
