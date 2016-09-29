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

[plugin-boilerplate]: https://github.com/posthtml/posthtml-plugin-boilerplate
