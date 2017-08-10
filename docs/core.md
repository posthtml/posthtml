## Modules

<dl>
<dt><a href="#module_posthtml">posthtml</a> ⇒ <code>function</code></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#PostHTML">PostHTML</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#Options">Options</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_posthtml"></a>

## posthtml ⇒ <code>function</code>
**Returns**: <code>function</code> - posthtml

```js
import posthtml from 'posthtml'
import plugin from 'posthtml-plugin'

const ph = posthtml([ plugin() ])
```  

| Param | Type |
| --- | --- |
| plugins | <code>Array</code> | 

<a name="PostHTML"></a>

## PostHTML
**Kind**: global class  
**Requires**: <code>module:api</code>, <code>module:package.json</code>, <code>module:posthtml-parser</code>, <code>module:posthtml-render</code>  
**Author:** Ivan Voischev (@voischev),
        Anton Winogradov (@awinogradov),
        Alexej Yaroshevich (@zxqfox),
        Vasiliy (@Yeti-or)  
**License**: MIT  
**Properties**

| Name | Description |
| --- | --- |
| name | Name (package.json) |
| version | Version (package.json) |


* [PostHTML](#PostHTML)
    * [new PostHTML(plugins)](#new_PostHTML_new)
    * [.parser](#PostHTML.parser) ⇒ <code>Array</code>
    * [.render](#PostHTML.render) ⇒ <code>String</code>
    * [.process(tree, options)](#PostHTML.process) ⇒ <code>Object.&lt;{html: String, tree: PostHTMLTree, messages: Array}&gt;</code> &#124; <code>Promise.&lt;{html: String, tree: PostHTMLTree, messages: Array}&gt;</code>

<a name="new_PostHTML_new"></a>

### new PostHTML(plugins)

| Param | Type | Description |
| --- | --- | --- |
| plugins | <code>Array</code> | Plugins |

<a name="PostHTML.parser"></a>

### PostHTML.parser ⇒ <code>Array</code>
**Kind**: static property of <code>[PostHTML](#PostHTML)</code>  
**Returns**: <code>Array</code> - tree  PostHTMLTree (JSON)  
**Requires**: <code>module:posthtml-parser</code>  

| Param | Type | Description |
| --- | --- | --- |
| html | <code>String</code> | Input (HTML) |

<a name="PostHTML.render"></a>

### PostHTML.render ⇒ <code>String</code>
**Kind**: static property of <code>[PostHTML](#PostHTML)</code>  
**Returns**: <code>String</code> - html  HTML  
**Requires**: <code>module:posthtml-render</code>  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>Array</code> | PostHTMLTree (JSON) |

<a name="PostHTML.process"></a>

### PostHTML.process(tree, options) ⇒ <code>Object.&lt;{html: String, tree: PostHTMLTree, messages: Array}&gt;</code> &#124; <code>Promise.&lt;{html: String, tree: PostHTMLTree, messages: Array}&gt;</code>
**Kind**: static method of <code>[PostHTML](#PostHTML)</code>  
**Returns**: <code>Object.&lt;{html: String, tree: PostHTMLTree, messages: Array}&gt;</code> - Sync Mode<code>Promise.&lt;{html: String, tree: PostHTMLTree, messages: Array}&gt;</code> - Async Mode (default)

**Sync Mode**
```js
const result = posthtml.process('<html>...</html>', { sync: true })
```

**Async Mode (default)**
```js
posthtml.process('<html>...</html>', {...options}).then((result) => result))
```  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>String</code> &#124; <code>Object</code> | Input (HTML/JSON) |
| options | <code>Object</code> | Options |

<a name="Options"></a>

## Options : <code>Object</code>
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| options.to | <code>String</code> | path to the file destination |
| options.from | <code>String</code> | path to the file source |
| options.sync | <code>Boolean</code> | enables sync mode, plugins will run synchronously, throws an error when used with async plugins |
| options.parser | <code>function</code> | use custom parser, replaces default (posthtml-parser) |
| options.render | <code>function</code> | use custom render, replaces default (posthtml-render) |

