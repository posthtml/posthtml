var SINGLE_TAGS = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  // Custom (PostHTML)
  'import',
  'include',
  'extend',
  'component'
]

/**
 * Render PostHTML Tree to HTML
 *
 * @param  {Array|Object} tree PostHTML Tree
 * @param  {Object} options Options
 *
 * @return {String} HTML
 */
function render (tree, options) {
  /**
   * Options
   *
   * @type {Object}
   *
   * @prop {Array<String|RegExp>} singleTags  Custom single tags (selfClosing)
   * @prop {String} closingSingleTag Closing format for single tag
   *
   * Formats:
   *
   * ``` tag: `<br></br>` ```, slash: `<br />` ```, ```default: `<br>` ```
   */
  options = options || {}

  var singleTags = SINGLE_TAGS.concat(options.singleTags || [])
  var singleRegExp = singleTags.filter(function (tag) {
    return tag instanceof RegExp ? tag : false
  })

  var closingSingleTag = options.closingSingleTag

  return html(tree)

  /**
   * HTML Stringifier
   *
   * @param  {Array|Object} tree PostHTML Tree
   *
   * @return {String} result HTML
   */
  function html (tree) {
    var result = ''

    traverse([].concat(tree), function (node) {
      if (!node) return

      if (typeof node === 'string' || typeof node === 'number') {
        result += node

        return
      }

      if (typeof node.tag === 'boolean' && !node.tag) {
        typeof node.content !== 'object' && (result += node.content)

        return node.content
      }

      // treat as new root tree if node is an array
      if (Array.isArray(node)) {
        result += html(node)

        return
      }

      var tag = node.tag || 'div'

      if (isSingleTag(tag, singleTags, singleRegExp)) {
        result += '<' + tag + attrs(node.attrs)

        switch (closingSingleTag) {
          case 'tag':
            result += '></' + tag + '>'

            break
          case 'slash':
            result += ' />'

            break
          default:
            result += '>'
        }
      } else {
        result += '<' + tag + (node.attrs ? attrs(node.attrs) : '') + '>' + (node.content ? html(node.content) : '') + '</' + tag + '>'
      }
    })

    return result
  }
}

/**
 * @module posthtml-render
 *
 * @version 1.0.7
 * @license MIT
 */
module.exports = render

/** @private */
function attrs (obj) {
  var attr = ''

  for (var key in obj) {
    if (typeof obj[key] === 'boolean' && obj[key]) {
      attr += ' ' + key
    } else if (
      typeof obj[key] === 'string' ||
      typeof obj[key] === 'number'
    ) {
      attr += ' ' + key + '="' + obj[key] + '"'
    }
  }

  return attr
}

/** @private */
function traverse (tree, cb) {
  if (Array.isArray(tree)) {
    for (var i = 0, length = tree.length; i < length; i++) {
      traverse(cb(tree[i]), cb)
    }
  } else if (typeof tree === 'object' && tree.hasOwnProperty('content')) {
    traverse(tree.content, cb)
  }

  return tree
}

/** @private */
function isSingleTag (tag, singleTags, singleRegExp) {
  if (singleRegExp.length) {
    for (var i = 0; i < singleRegExp.length; i++) {
      return !!tag.match(singleRegExp[i])
    }
  }

  if (singleTags.indexOf(tag) === -1) {
    return false
  }

  return true
}
