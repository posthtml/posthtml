/* global Promise */
var parser = require('posthtml-parser');
var render = require('posthtml-render');

var api = require('./api.js');

function PostHTML(plugins) {
    this.plugins = plugins || [];
}

/**
 * Parse html to json tree
 * @param {String} html htmltree
 * @returns {PostHTMLTree} json jsontree
 */
PostHTML.parse = function(html) {
    return parser(html);
};

/**
* Use plugin
*
* @param {Function} plugin - PostHTML plugin to register
* @returns {PostHTML}
*/
PostHTML.prototype.use = function(plugin) {
    this.plugins.push(plugin);
    return this;
};

/**
 * @param {String|PostHTMLTree} tree - html/json tree
 * @param {?Object} options - Options object
 * @param {?Boolean} options.skipParse - to prevent parsing incoming tree
 * @param {?Boolean} options.sync - to run plugins syncronously, will throw
 *                                  if there are async plugins
 * @returns {Promise<{html: String, tree: PostHTMLTree}>|
 *          {html: String, tree: PostHTMLTree}} - result
 */
PostHTML.prototype.process = function(tree, options) {
    options = options || {};
    tree = options.skipParse ? tree : PostHTML.parse(tree);
    tree.options = options;

    // sync mode
    if (options.sync === true) {
        this.plugins.forEach(function(plugin) {
            apiExtend(tree);

            var result;
            if (plugin.length === 2 || isPromise(result = plugin(tree))) {
                throw new Error(
                    'Can’t process synchronously because of async plugin: ' +
                    plugin.name
                );
            }
            // return the previous tree unless result is filled
            tree = result || tree;
        });

        return {
            html: render(tree, tree.options),
            tree: tree
        };
    }

    // async mode
    var i = 0,
        next = function(res, cb) {
            // all plugins called
            if (this.plugins.length <= i) {
                cb(null, res);
                return;
            }

            // little helper to go to the next iteration
            function _next(pluginResult) {
                return next(pluginResult || res, cb);
            }

            // (re)extend the object
            apiExtend(res);

            // call next
            var plugin = this.plugins[i++];
            if (plugin.length === 2) {
                plugin(res, function(err, pluginResult) {
                    if (err) return cb(err);
                    _next(pluginResult);
                });
                return;
            }

            // sync and promised plugins
            var err = null;
            var pluginResult = tryCatch(function() {
                return plugin(res);
            }, function(e) {
                err = e;
                return err;
            });

            if (err) {
                cb(err);
                return;
            }

            if (isPromise(pluginResult)) {
                pluginResult.then(_next).catch(cb);
                return;
            }

            _next(pluginResult);
        }.bind(this);

    return new Promise(function(resolve, reject) {
        next(tree, function(err, tree) {
            if (err) return reject(err);

            resolve({
                html: render(tree, tree.options),
                tree: tree
            });
        });
    });
};

module.exports = function(plugins) {
    return new PostHTML(plugins);
};

/**
 * Checks the argument to be a Promise (or thenable) object.
 *
 * @param {*} p - Target object to test
 * @returns {Boolean}
 */
function isPromise(p) {
    return typeof Promise === 'function' && p instanceof Promise ||
           typeof p === 'function' && p.then && p.catch;
}

/**
 * Simple tryCatch helper
 *
 * @param {Function} tryFn - try block
 * @param {Function} catchFn - catch block
 * @returns {?*} - result if exists
 */
function tryCatch(tryFn, catchFn) {
    var res;
    try {
        res = tryFn();
    } catch (e) {
        catchFn(e);
    }
    return res;
}

function apiExtend(tree) {
    tree.walk = api.walk;
    tree.match = api.match;
}
