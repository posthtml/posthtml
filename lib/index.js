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
 * @requires posthtml-parser
 * @requires posthtml-render
 *
 * @constructor PostHTML
 * @param {Array} plugins - An array of PostHTML plugins
 */
function PostHTML (plugins) {
/**
 * PostHTML Instance
 *
 * @prop plugins
 * @prop options
 */
  this.version = pkg.version
  this.name = pkg.name
  this.plugins = typeof plugins === 'function' ? [plugins] : plugins || []
}

/**
 * @requires posthtml-parser
 *
 * @param   {String} html - Input (HTML)
 * @returns {Array}  tree - PostHTMLTree (JSON)
 */
PostHTML.parser = parser
/**
 * @requires posthtml-render
 *
 * @param   {Array}  tree - PostHTMLTree (JSON)
 * @returns {String} html - HTML
 */
PostHTML.render = render

/**
* @this posthtml
* @param   {Function} plugin - A PostHTML plugin
* @returns {Constructor} - this(PostHTML)
*
* **Usage**
* ```js
* ph.use((tree) => { tag: 'div', content: tree })
*   .process('<html>..</html>', {})
*   .then((result) => result))
* ```
*/
PostHTML.prototype.use = function () {
  [].push.apply(this.plugins, arguments)
  return this
}

/**
 * @param   {String} html - Input (HTML)
 * @param   {?Object} options - PostHTML Options
 * @returns {Object<{html: String, tree: PostHTMLTree}>} - Sync Mode
 * @returns {Promise<{html: String, tree: PostHTMLTree}>} - Async Mode (default)
 *
 * **Usage**
 *
 * **Sync**
 * ```js
 * ph.process('<html>..</html>', { sync: true }).html
 * ```
 *
 * **Async**
 * ```js
 * ph.process('<html>..</html>', {}).then((result) => result))
 * ```
 */
PostHTML.prototype.process = function (tree, options) {
  /**
   * ## PostHTML Options
   *
   * @type {Object}
   * @prop {?Boolean} options.sync - enables sync mode, plugins will run synchronously, throws an error when used with async plugins
   * @prop {?Function} options.parser - use custom parser, replaces default (posthtml-parser)
   * @prop {?Function} options.render - use custom render, replaces default (posthtml-render)
   * @prop {?Boolean} options.skipParse - disable parsing
   */
  options = options || {}

  if (options.parser) parser = options.parser
  if (options.render) render = options.render

  tree = options.skipParse
    ? tree || []
    : parser(tree, options)

  tree.options = options

  /**
   * Messages to store and pass metadata
   *
   * @memberof tree
   *
   * @type {Array} messages
   *
   * @example
   * ```js
   * module.exports = function plugin (options = {}) {
   *   return function (tree) {
   *      const message = {
   *        type: 'dependency',
   *        file: 'path/to/dependency.html',
   *        from: tree.options.from
   *      }
   *
   *      tree.messages.push(message)
   *
   *      return tree
   *   }
   * }
   * ```
   */
  tree.messages = []
  tree.processor = this

  // sync mode
  if (options.sync === true) {
    this.plugins.forEach(function (plugin) {
      api(tree)

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
      cb(null, result)
      return
    }

    // little helper to go to the next iteration
    function _next (res) {
      return next(res || result, cb)
    }

    // (re)extend the object
    api(result)

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
    }, function (e) {
      err = e
      return e
    })

    if (err) {
      cb(err)
      return
    }

    if (isPromise(res)) {
      res.then(_next).catch(cb)
      return
    }

    _next(res)
  }.bind(this)

  return new Promise(function (resolve, reject) {
    next(tree, function (err, tree) {
      if (err) reject(err)
      else resolve(lazyResult(render, tree))
    })
  })
}

/**
 * @exports posthtml
 *
 * @param  {Array} plugins
 * @return {Function} posthtml
 *
 * **Usage**
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
 * Wraps the PostHTMLTree within an object using a getter to render HTML on demand.
 *
 * @private
 *
 * @param   {Function} render
 * @param   {Array}    tree
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
