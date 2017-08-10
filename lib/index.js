var pkg = require('../package.json')
var api = require('./api.js')

var parser = require('posthtml-parser')
var render = require('posthtml-render')

/**
 * @author Ivan Voischev (@voischev),
 *         Anton Winogradov (@awinogradov),
 *         Alexej Yaroshevich (@zxqfox),
 *         Vasiliy (@Yeti-or)
 *
 * @requires api
 * @requires package.json
 * @requires posthtml-parser
 * @requires posthtml-render
 *
 * @constructor PostHTML
 *
 * @prop name Name
 * @prop version Version
 *
 * @param {Array} plugins  Plugins
 */
function PostHTML (plugins) {
  this.name = pkg.name
  this.version = pkg.version
  this.plugins = typeof plugins === 'function' ? [plugins] : plugins || []
}

/**
 * @requires posthtml-parser
 *
 * @param   {String} html  Input (HTML)
 * @returns {Array}  tree  PostHTMLTree (JSON)
 */
PostHTML.parser = parser

/**
 * @requires posthtml-render
 *
 * @param   {Array}  tree  PostHTMLTree (JSON)
 * @returns {String} html  HTML
 */
PostHTML.render = render

/**
* @memberof posthtml
*
* @method use
*
* @param {Function} plugin PostHTML Plugin
*
* @returns {Constructor} this (PostHTML Instance)
*
* ```js
* posthtml.use((tree) => { tag: 'div', content: tree })
*   .process('<html>...</html>', {...options})
*   .then((result) => result))
* ```
*/
PostHTML.prototype.use = function () {
  [].push.apply(this.plugins, arguments)
  return this
}

/**
 * @memberof PostHTML
 *
 * @method process
 *
 * @param {String|Object} tree Input (HTML/JSON)
 * @param {?Object} options Options
 *
 * @returns {Object<{html: String, tree: PostHTMLTree, messages: Array}>} Sync Mode
 * @returns {Promise<{html: String, tree: PostHTMLTree, messages: Array}>} Async Mode (default)
 *
 * **Sync Mode**
 * ```js
 * const result = posthtml.process('<html>...</html>', { sync: true })
 * ```
 *
 * **Async Mode (default)**
 * ```js
 * posthtml.process('<html>...</html>', {...options}).then((result) => result))
 * ```
 */
PostHTML.prototype.process = function (tree, options) {
  /**
   * @name Options
   *
   * @type {Object}
   *
   * @prop {String} options.to path to the file destination
   * @prop {String} options.from path to the file source
   * @prop {Boolean} options.sync enables sync mode, plugins will run synchronously, throws an error when used with async plugins
   * @prop {Function} options.parser use custom parser, replaces default (posthtml-parser)
   * @prop {Function} options.render use custom render, replaces default (posthtml-render)
   */
  options = options || {}

  if (options.parser && typeof options.parser === 'function') {
    parser = options.parser
  }
  if (options.render && typeof options.render === 'function') {
    render = options.render
  }

  tree = typeof tree === 'object' ? tree : parser(tree)

  tree.processor = this

  tree.options = options
  tree.messages = []

  // sync mode
  if (options.sync === true) {
    this.plugins.forEach(function (plugin) {
      apiExtend(tree)

      var result

      if (plugin.length === 2 || isPromise(result = plugin(tree))) {
        throw new Error(
          'Can’t process contents in sync mode because of async plugin: ' + plugin.name
        )
      }
      // return the previous tree unless result is fulfilled
      tree = result || tree
    })

    return lazyResult(render, tree)
  }

  // async mode
  var i = 0

  var next = function (result, cb) {
    // all plugins called
    if (this.plugins.length <= i) {
      return cb(null, result)
    }

    // little helper to go to the next iteration
    function _next (res) {
      return next(res || result, cb)
    }

    // (re)extend the object
    apiExtend(result)

    // call next
    var plugin = this.plugins[i++]

    if (plugin.length === 2) {
      plugin(result, function (err, res) {
        if (err) return cb(err)
        _next(res)
      })
      return
    }

    // sync and promised plugins
    var err = null

    var res = tryCatch(function () {
      return plugin(result)
    }, function (err) {
      return err
    })

    if (err) return cb(err)

    if (isPromise(res)) {
      return res
        .then(_next)
        .catch(cb)
    }

    _next(res)
  }.bind(this)

  return new Promise(function (resolve, reject) {
    next(tree, function (err, tree) {
      if (err) reject(err)

      resolve(lazyResult(render, tree))
    })
  })
}

/**
 * @module posthtml
 *
 * @param  {Array} plugins
 *
 * @return {Function} posthtml
 *
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

/**
 * Checks if parameter is a Promise (or thenable) object.
 *
 * @private
 *
 * @param   {*} promise - Target `{}` to test
 *
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
 * @param   {Function} tryFn - try block
 * @param   {Function} catchFn - catch block
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
 * @param   {Array} tree - PostHTMLTree
 *
 * @returns {Array} tree - PostHTMLTree with API
 */
function apiExtend (tree) {
  tree.walk = api.walk
  tree.match = api.match
  tree.error = api.error
  tree.warning = api.warning
  tree.dependency = api.dependency
}

/**
 * Wraps the PostHTMLTree within an object using a getter to render HTML on demand.
 *
 * @private
 *
 * @param   {Function} render
 * @param   {Array}    tree
 *
 * @returns {Object<{html: String, tree: Array, messages: Array}>}
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
