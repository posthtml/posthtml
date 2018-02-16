<a name="tree"></a>

## tree : <code>object</code>
# API

**Kind**: global namespace  
**Author**: Ivan Voischev (@voischev),
        Anton Winogradov (@awinogradov),
        Alexej Yaroshevich (@zxqfox),
        Vasiliy (@Yeti-or)  

* [tree](#tree) : <code>object</code>
    * [.walk(cb)](#tree.walk) ⇒ <code>function</code>
    * [.match(expression, cb)](#tree.match) ⇒ <code>function</code>

<a name="tree.walk"></a>

### tree.walk(cb) ⇒ <code>function</code>
Walks the tree and passes all nodes via a callback

**Kind**: static method of [<code>tree</code>](#tree)  
**Returns**: <code>function</code> - Callback(node)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback |

**Example**  
```js
export const walk = (tree) => {
  tree.walk((node) => {
    let classes = node.attrs && node.attrs.class.split(' ') || []

    if (classes.includes(className)) return cb(node)
      return node
  })
}
```
<a name="tree.match"></a>

### tree.match(expression, cb) ⇒ <code>function</code>
Matches an expression to search for nodes in the tree

**Kind**: static method of [<code>tree</code>](#tree)  
**Returns**: <code>function</code> - Callback(node)  

| Param | Type | Description |
| --- | --- | --- |
| expression | <code>String</code> \| <code>RegExp</code> \| <code>Object</code> \| <code>Array</code> | Matcher(s) to search |
| cb | <code>function</code> | Callback |

**Example**  
```js
export const match = (tree) => {
  // Single matcher
  tree.match({ tag: 'custom-tag' }, (node) => {
    let tag = node.tag

    Object.assign(node, { tag: 'div', attrs: {class: tag} })

    return node
  })
  // Multiple matchers
  tree.match([{ tag: 'b' }, { tag: 'strong' }], (node) => {
    let style = 'font-weight: bold;'

    node.tag = 'span'

    node.attrs
      ? ( node.attrs.style
        ? ( node.attrs.style += style )
        : node.attrs.style = style
      )
      : node.attrs = { style: style }

    return node
  })
}
```
