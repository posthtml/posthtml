'use strict'

const PluginError = require('./Error')

/**
 * # API
 * @author Ivan Voischev (@voischev),
 *         Anton Winogradov (@awinogradov),
 *         Alexej Yaroshevich (@zxqfox),
 *         Vasiliy (@Yeti-or)
 * @module API
 * @namespace tree
 */
module.exports = {
  /**
   * walk the tree and pass all nodes to callback
   *
   * @memberof tree
   * @param  {Function} cb - Callback
   * @return {Function}    - Node in callback
   *
   ***Usage**
   * ```js
   * export const walk = (tree) => {
   *   tree.walk((node) => {
   *     let classes = node.attrs && node.attrs.class.split(' ') || []
   *
   *     if (classes.includes(className)) return cb(node)
   *       return node
   *   })
   * }
   * ```
   */
  walk: function (cb) {
    return traverse(this, cb)
  },
  /**
   * match expression to search nodes in the tree
   *
   * @memberof tree
   * @param  {String|RegExp|Object|Array} expression - Matcher(s) to search
   * @param  {Function} cb - Callback
   * @return {Function}    - Node in callback
   *
   ***Usage**
   * ```js
   * export const match = (tree) => {
   *   // Single matcher
   *   tree.match({ tag: 'custom-tag' }, (node) => {
   *     let tag = node.tag
   *
   *     Object.assign(node, { tag: 'div', attrs: {class: tag} })
   *
   *     return node
   *   })
   *   // Multiple matchers
   *   tree.match([{ tag: 'b' }, { tag: 'strong' }], (node) => {
   *     let style = 'font-weight: bold;'
   *
   *     node.tag = 'span'
   *
   *     node.attrs
   *       ? ( node.attrs.style
   *         ? ( node.attrs.style += style )
   *         : node.attrs.style = style
   *       )
   *       : node.attrs = { style: style }
   *
   *     return node
   *   })
   * }
   * ```
   */
  match: function (expression, cb) {
    return Array.isArray(expression)
      ? traverse(this, function (node) {
        for (var i = 0; i < expression.length; i++) {
          if (compare(expression[i], node)) return cb(node)
        }

        return node
      })
      : traverse(this, function (node) {
        if (compare(expression, node)) return cb(node)

        return node
      })
  },
  /**
   * plugin messages to store and pass metadata
   *
   * @memberof tree
   * @type {Array} messages
   *
   ***Usage**
   * ```js
   * export default function plugin (options = {}) {
   *   return function (tree) {
   *      tree.messages.push({
   *        type: 'dependency',
   *        file: 'path/to/dependency.html',
   *        from: tree.options.from
   *      })
   *
   *      return tree
   *   }
   * }
   * ```
   */
  // BUG previous messages aren't cleaned up
  // messages: [],
  /**
   * Messages Error API
   *
   * push plugin errors to result.messages for reporting
   *
   * @memberof tree
   *
   * @method error
   *
   * @param  {String} plugin   Name ('posthtml-plugin')
   * @param  {String} message  Error
   *
   * @return {Object} PostHTML Error Message
   *
   * ```js
   * tree.error('posthtml-plugin', 'Error', node.location)
   * ```
   */
  error: function (plugin, message, location) {
    const err = new PluginError({
      src: this.src,
      file: this.options.from,
      name: 'PluginError',
      plugin,
      message,
      location: location || false
    })

    return this.messages.push({
      type: 'error',
      file: this.options.from,
      plugin,
      message: err.message
    })
  },
  /**
   * Messages Warning API
   *
   * push plugin warnings to result.messages for reporting
   *
   * @memberof tree
   *
   * @method warning
   *
   * @param  {String} plugin   Name ('posthtml-plugin')
   * @param  {String} message  Warning
   *
   * @return {Object} PostHTML Warning Message
   *
   * ```js
   * tree.warning('posthtml-plugin', 'Warning', node.location)
   * ```
   */
  warn: function (plugin, message, location) {
    const warning = new PluginError({
      src: this.src,
      file: this.options.from,
      name: 'PluginWarning',
      plugin,
      message,
      location: location || false
    })

    return this.messages.push({
      type: 'warning',
      file: this.options.from,
      plugin,
      message () {
        return warning.message
      }
    })
  },
  /**
   * Message Dependency API
   *
   * push dependencies added by plugins to result.messages for reporting/watching
   * @memberof tree
   *
   * @method dependency
   *
   * @param  {String} file File
   *
   * @return {Object} PostHTML Dependency Message
   *
   * ```js
   * tree.dependency('path/to/file.ext')
   * ```
   */
  dependency: function (file) {
    return this.messages.push({
      type: 'dependency',
      file,
      from: this.options.from
    })
  }
}

/** @private */
function traverse (tree, cb) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      tree[i] = traverse(cb(tree[i]), cb)
    }
  } else if (
      tree &&
      typeof tree === 'object' &&
      tree.hasOwnProperty('content')
  ) traverse(tree.content, cb)

  return tree
}

/** @private */
function compare (expected, actual) {
  if (expected instanceof RegExp) {
    if (typeof actual === 'object') return false
    if (typeof actual === 'string') return expected.test(actual)
  }

  if (typeof expected !== typeof actual) return false
  if (typeof expected !== 'object' || expected === null) {
    return expected === actual
  }

  if (Array.isArray(expected)) {
    return expected.every(function (exp) {
      return [].some.call(actual, function (act) {
        return compare(exp, act)
      })
    })
  }

  return Object.keys(expected).every(function (key) {
    var ao = actual[key]
    var eo = expected[key]

    if (typeof eo === 'object' && eo !== null && ao !== null) {
      return compare(eo, ao)
    }
    if (typeof eo === 'boolean') {
      return eo !== (ao == null)
    }

    return ao === eo
  })
}
