# Plugins

A PostHTML plugin is a simple function with a single argument.

> Use [posthtml-plugin-starter][plugin-starter] to create a new plugin.

## Synchronous

```js
export default function postHTMLPluginName(tree) {
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

export default function postHTMLPluginName(tree, cb) {
  let tasks = 0

  tree.match({ tag: 'a' }, (node) => {
    // skip local anchors
    if (!/^(https?:)?\/\//.test(node.attrs.href)) {
      return node
    }

    request.head(node.attrs.href, (err, resp) => {
      if (err) return done()

      if (resp.statusCode >= 400) {
        node.attrs.class += ' Erroric'
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

## Asynchronous with async/await

`walk` and `match` callbacks are synchronous: they cannot `await`. Collect the
nodes first, then do the async work and update them. A plugin that returns a
Promise must run in async mode (the default).

```js
export default function plugin() {
  return async function (tree) {
    const nodes = []

    tree.match({ tag: 'user-info' }, (node) => {
      nodes.push(node)
      return node
    })

    await Promise.all(nodes.map(async (node) => {
      const response = await fetch(`https://example.com/api/users/${node.attrs['data-user-id']}`)

      node.tag = 'div'
      node.content = tree.parser(await response.text())
    }))
  }
}
```

## Return values

### From a plugin

| Plugin returns | Result |
| --- | --- |
| nothing (`undefined`) or another falsy value | the same tree is passed on, with all changes made in place |
| a tree (array or node) | the returned tree replaces the current one |
| a Promise | its resolved value follows the same rules |

Async callback plugins (`(tree, cb)`) follow the same rules for the value passed
to `cb(err, result)`.

Changing the tree in place and returning nothing is enough in most plugins. If a
plugin returns a new tree, changes made to the old tree are kept only if they
are part of the new one.

### From `walk` and `match` callbacks

The callback return value **always** replaces the node, so return the node even
if it was changed in place.

| Callback returns | Result |
| --- | --- |
| the node | the node is kept, with all changes made in place |
| a new node or a string | replaces the node |
| an array of nodes and strings | replaces the node with several nodes |
| `null`, `undefined`, `false` or `''` | removes the node |

A missing `return` removes the node. `walk` also visits text nodes (strings),
so return them too:

```js
tree.walk((node) => {
  if (node.attrs && node.attrs['data-remove'] !== undefined) {
    return null
  }

  return node
})
```

Returned nodes are walked again. Do not put the current node back into an
array (`[node, extra]` or `{ tag: 'span', content: [node] }`): the callback
would match it again forever. To wrap a node, pass it as the content directly:
`{ tag: 'span', content: node }`.

## Messages
> Tree messages to store and pass metadata between plugins

```js
export default function plugin(options = {}) {
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
export default function plugin(options = {}) {
  return function (tree) {
    tree.match({ tag: 'include' }, function (node) {
      node.tag = false
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
export default function plugin(options = {}) {
  return function (tree) {
    var outherTree = ['\n', {tag: 'div', content: ['1']}, '\n\t', {tag: 'div', content: ['2']}, '\n']
    var htmlWitchoutSpaceless = tree.render(outherTree).replace(/[\n|\t]/g, '')
    return tree.parser(htmlWitchoutSpaceless)
  }
}
```

[plugin-starter]: https://github.com/posthtml/posthtml-plugin-starter
