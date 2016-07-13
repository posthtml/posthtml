'use strict';

var parser = require('posthtml-parser');
var render = require('posthtml-render');

var api = require('./api.js');

/**
 * @typedef {Array<PostHTMLTreeNode|String>} PostHTMLTree
 */

/**
 * @typedef {Object} PostHTMLTreeNode
 * @property {String} tag
 * @property {Object<String, String>} attrs
 * @property {PostHTMLTree} content
 */

/**
 * @param {Array<Function>} plugins
 * @constructor
 */
function PostHTML(plugins) {
    this.plugins = plugins || [];
}

/**
 * Default parser
 *
 * @param {String} html htmltree
 * @returns {PostHTMLTree} json jsontree
 */
PostHTML.parse = parser;

/**
* Use plugin
*
* @param {...Function} plugin PostHTML plugins to register
* @returns {PostHTML}
*/
PostHTML.prototype.use = function() {
    [].push.apply(this.plugins, arguments);
    return this;
};


/**
 * @typedef {Object} PostHTMLProcessOptions
 * @property {Boolean} [skipParse=false] to prevent parsing incoming tree
 * @property {Boolean} [sync=false] to run plugins synchronously, will throw if there
 *                            are async plugins
 * @property {Function} [parser] alternate parser to replace default
 */

/**
 * @typedef {Object} PostHTMLProcessResult
 * @property {String} html
 * @property {PostHTMLTree} tree
 */

/**
 * @param {String|PostHTMLTree} tree html/json tree
 * @param {PostHTMLProcessOptions} options
 * @returns {Promise<PostHTMLProcessResult>|PostHTMLProcessResult}
 */
PostHTML.prototype.process = function(tree, options) {
    options = options || {};
    var parser = options.parser || PostHTML.parse.bind(PostHTML);
    tree = options.skipParse ? tree : parser(tree, options.parserOptions);
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

        return lazyRender(tree);
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
            if (err) reject(err);
            else resolve(lazyRender(tree));
        });
    });
};

module.exports = function(plugins) {
    return new PostHTML(plugins);
};

/**
 * Checks if parameter is a Promise (or thenable) object.
 *
 * @param {*} p - Target object to test
 * @returns {Boolean}
 */
function isPromise(p) {
    return !!p && typeof p.then === 'function';
}

/**
 * Simple tryCatch helper
 *
 * @param {Function} tryFn - try block
 * @param {Function} catchFn - catch block
 * @returns {?*} - result if exists
 */
function tryCatch(tryFn, catchFn) {
    try {
        return tryFn();
    } catch (e) {
        catchFn(e);
    }
}

function apiExtend(tree) {
    tree.walk = api.walk;
    tree.match = api.match;
}

/**
 * Wraps tree in object with getter that renders it
 * as HTML on demand.
 *
 * @param {PostHTMLTree} tree - json tree to wrap
 * @returns {PostHTMLTree} - result
 */
function lazyRender(tree) {
    return {
        get html() {
            return render(tree, tree.options);
        },
        tree: tree
    };
}
