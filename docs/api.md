<a name="tree"></a>

## tree : <code>object</code>
# API

**Kind**: global namespace  
**Author:** Ivan Voischev (@voischev),
        Anton Winogradov (@awinogradov),
        Alexej Yaroshevich (@zxqfox),
        Vasiliy (@Yeti-or)  
**License**: MIT  

* [tree](#tree) : <code>object</code>
    * [.walk(cb)](#tree.walk) ⇒ <code>function</code>
    * [.match(expression, cb)](#tree.match) ⇒ <code>function</code>
    * [.error(plugin, message)](#tree.error) ⇒ <code>Object</code>
    * [.warning(plugin, message)](#tree.warning) ⇒ <code>Object</code>
    * [.dependency(file)](#tree.dependency) ⇒ <code>Object</code>

<a name="tree.walk"></a>

### tree.walk(cb) ⇒ <code>function</code>
walk the tree and pass all nodes to callback

**Kind**: static method of <code>[tree](#tree)</code>  
**Returns**: <code>function</code> - Node

```js
export const walk = (tree) => {
  tree.walk((node) => {
    let classes = node.attrs && node.attrs.class.split(' ') || []

    if (classes.includes(className)) return cb(node)
      return node
  })
}
```  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback |

<a name="tree.match"></a>

### tree.match(expression, cb) ⇒ <code>function</code>
match expression to search nodes in the tree

**Kind**: static method of <code>[tree](#tree)</code>  
**Returns**: <code>function</code> - Node

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

| Param | Type | Description |
| --- | --- | --- |
| expression | <code>String</code> &#124; <code>RegExp</code> &#124; <code>Object</code> &#124; <code>Array</code> | Matcher(s) |
| cb | <code>function</code> | Callback |

<a name="tree.error"></a>

### tree.error(plugin, message) ⇒ <code>Object</code>
push plugin errors to result.messages for reporting

**Kind**: static method of <code>[tree](#tree)</code>  
**Returns**: <code>Object</code> - PostHTML Error Message

```js
tree.error('posthtml-plugin', 'Error')
```  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>String</code> | Name ('posthtml-plugin') |
| message | <code>String</code> | Error |

<a name="tree.warning"></a>

### tree.warning(plugin, message) ⇒ <code>Object</code>
push plugin warnings to result.messages for reporting

**Kind**: static method of <code>[tree](#tree)</code>  
**Returns**: <code>Object</code> - PostHTML Warning Message

```js
tree.warning('posthtml-plugin', 'Warning')
```  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>String</code> | Name ('posthtml-plugin') |
| message | <code>String</code> | Warning |

<a name="tree.dependency"></a>

### tree.dependency(file) ⇒ <code>Object</code>
push dependencies added by plugins to result.messages for reporting/watching

**Kind**: static method of <code>[tree](#tree)</code>  
**Returns**: <code>Object</code> - PostHTML Dependency Message

```js
tree.dependency('path/to/file.ext')
```  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | File |

