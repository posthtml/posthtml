'use strict'

const pkg = require('../package.json')
const api = require('./api.js')

let parser = require('posthtml-parser')
let render = require('posthtml-render')
/**
 * @class PostHTML
 */
class PostHTML {
/**
 * PostHTML Instance
 *
 * @constructor
 *
 * @param {Array} plugins PostHTML Plugins
 */
  constructor (plugins) {
    this.name = pkg.name
    this.version = pkg.version
    this.plugins = typeof plugins === 'function'
      ? [ plugins ]
      : plugins || []
  }
  /**
   * PostHTML Parser
   *
   * @requires posthtml-parser
   *
   * @param {String} html HTML
   * @param {Object} options Parser Options
   *
   * @returns {Array} tree PostHTML Tree (JSON)
  */
  static parse (html, options) {
    return parser(html, options)
  }

  /**
   * PostHTML Render
   *
   * @requires posthtml-render
   *
   * @param {Array} tree PostHTML Tree (JSON)
   * @param {Object} options Render Options
   *
   * @returns {String} html HTML
   */
  static render (tree, options) {
    return render(tree, options)
  }
  /**
   * PostHTML Use
   *
   * @this posthtml
   *
   * @param {Function} plugin PostHTML Plugin
   *
   * @returns {Constructor} - this (PostHTML Instance)
   *
   * @example
   * ```js
   * posthml.use((tree) => ({ tag: 'div', content: tree })
   *   .process('<html>...</html>', options)
   *   .then((result) => result))
   * ```
   */
  use () {
    [].push.apply(this.plugins, arguments)

    return this
  }

  /**
   * PostHTML Process
   *
   * @param {String} html HTML
   * @param {?Object} options PostHTML Options
   *
   * @returns {Object<{html: String, tree: PostHTMLTree}>} Sync Mode
   * @returns {Promise<{html: String, tree: PostHTMLTree}>} Async Mode (default)
   *
   * @example
   * **Sync**
   * ```js
   * posthtml.process('<html>...</html>', { sync: true }).html
   * ```
   *
   * **Async**
   * ```js
   * posthtml.process('<html>...</html>', {}).then((result) => result))
   * ```
   */
  process (tree, options) {
   /**
    * PostHTML Options
    *
    * @type {Object}
    *
    * @prop {?Boolean} options.sync Sync Mode
    * @prop {?Function} options.parser - Custom Parser
    * @prop {?Function} options.render - Custom Render
    * @prop {?Boolean} options.skipParse - Disable Parsing
    */
    options = options || {}

    if (options.parser) parser = options.parser
    if (options.render) render = options.render

    tree = options.skipParse
      ? tree
      : parser(tree, options)

    tree.options = options
    tree.processor = this

    // Sync Mode
    if (options.sync === true) {
      this.plugins.forEach((plugin) => {
        apiExtend(tree)

        let result

        if (plugin.length === 2 || isPromise(result = plugin(tree))) {
          throw new Error(
            `Can’t process contents in sync mode because of async plugin: ${plugin.name}`
          )
        }
        // Return the previous tree unless result is fulfilled
        tree = result || tree
      })

      return lazyResult(render, tree)
    }

    // Async mode
    let i = 0

    const next = function (result, cb) {
      // All plugins called
      if (this.plugins.length <= i) {
        cb(null, result)

        return
      }

      // Little helper to go to the next iteration
      function _next (res) {
        return next(res || result, cb)
      }

      // (Re)extend the object
      apiExtend(result)

      // Call next
      let plugin = this.plugins[i++]

      if (plugin.length === 2) {
        plugin(result, (err, res) => {
          if (err) return cb(err)

          _next(res)
        })

        return
      }

      // Sync and promised plugins
      let err = null

      let res = tryCatch(
        () => plugin(result),
        (e) => {
          err = e

          return e
        }
      )

      if (err) {
        cb(err)

        return
      }

      if (isPromise(res)) {
        res
          .then(_next)
          .catch(cb)

        return
      }

      _next(res)
    }.bind(this)

    return new Promise((resolve, reject) => {
      next(tree, (err, tree) => {
        if (err) reject(err)
        else resolve(lazyResult(render, tree))
      })
    })
  }
}
/**
 * @author Ivan Voischev (@voischev),
 *         Anton Winogradov (@awinogradov),
 *         Alexej Yaroshevich (@zxqfox),
 *         Vasiliy (@Yeti-or)
 *
 * @module posthtml
 * @license MIT
 *
 * @requires ./api
 * @requires posthtml-parser
 * @requires posthtml-render
 *
 * @param {Array} plugins
 *
 * @return {Function} posthtml
 *
 * @example
 * ```js
 * import posthtml from 'posthtml'
 * import plugin from 'posthtml-plugin'
 *
 * const ph = posthtml([ plugin() ])
 * ```
 */
module.exports = function (plugins) {
  return new PostHTML(plugins)
}

module.exports.parse = PostHTML.parse
module.exports.render = PostHTML.render

/**
 * Checks if parameter is a Promise (or thenable) object.
 *
 * @private
 *
 * @param {*} promise - Target `{}` to test
 * @returns {Boolean}
 */
function isPromise (promise) {
  return !!promise && typeof promise.then === 'function'
}

/**
 * Simple try/catch helper, if exists, returns result
 *
 * @private
 *
 * @param {Function} tryFn try block
 * @param {Function} catchFn catch block
 *
 * @returns {?*}
 */
function tryCatch (tryFn, catchFn) {
  try {
    return tryFn()
  } catch (err) {
    catchFn(err)
  }
}

/**
 * Extends the PostHTMLTree with the Tree API
 *
 * @private
 *
 * @param   {Array} tree PostHTML Tree
 * @returns {Array} tree PostHTML Tree (API)
 */
function apiExtend (tree) {
  tree.walk = api.walk
  tree.match = api.match
  tree.messages = api.messages
}

/**
 * Wraps the PostHTMLTree within an object using a getter to render HTML on demand.
 *
 * @private
 *
 * @param   {Function} render
 * @param   {Array} tree
 *
 * @returns {Object<{html: String, tree: Array}>}
 */
function lazyResult (render, tree) {
  return {
    get html () {
      return render(tree, tree.options)
    },
    tree: tree,
    messages: tree.messages
  }
}
