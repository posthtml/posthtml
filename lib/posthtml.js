import parser from 'posthtml-parser';
import render from 'posthtml-render';
import api from './api.js';

class PostHTML {

    constructor(plugins = []) {
        this.plugins = plugins;
    }
    /**
     * Parse html to json tree
     * @param {String} html htmltree
     * @returns {PostHTMLTree} json jsontree
     */
    static parse(html) {
        return parser(html);
    }
    /**
     * Use plugin
     *
     * @param {Function} plugin - PostHTML plugin to register
     * @returns {PostHTML}
     */
    use(plugin) {
        this.plugins.push(plugin);
        return this;
    }
    /**
     * @param {String|PostHTMLTree} tree - html/json tree
     * @param {?Object} options - Options object
     * @param {?Boolean} options.skipParse - to prevent parsing incoming tree
     * @param {?Boolean} options.sync - to run plugins syncronously, will throw if there are async plugins
     * @returns {Promise<{html: String, tree: PostHTMLTree}>|{html: String, tree: PostHTMLTree}} - result
     */
    process(tree, options = {}) {
        tree = options.skipParse ? tree : PostHTML.parse(tree);
        tree.options = options;

        // sync mode
        if (options.sync === true) {
            this.plugins.forEach(plugin => {
                apiExtend(tree);

                let result;
                if (plugin.length === 2 || isPromise(result = plugin(tree))) {
                    throw new Error(`Can’t process synchronously because of async plugin: ${plugin.name}`);
                }
                // return the previous tree unless result is filled
                tree = result || tree;
            });

            return {
                html: render(tree, tree.options),
                tree
            };
        }

        // async mode
        let i = 0,
            next = (res, cb) => {
                // all plugins called
                if (this.plugins.length <= i) {
                    cb(null, res);
                    return;
                }

                // little helper to go to the next iteration
                let _next = pluginResult => next(pluginResult || res, cb);

                // (re)extend the object
                apiExtend(res);

                // call next
                let plugin = this.plugins[i++];
                if (plugin.length === 2) {
                    plugin(res, (err, pluginResult) => {
                        if (err) return cb(err);
                        _next(pluginResult);
                    });
                    return;
                }

                // sync and promised plugins
                let err = null;
                let pluginResult = tryCatch(() => plugin(res), (e) => err = e);
                if (err) {
                    cb(err);
                    return;
                }

                if (isPromise(pluginResult)) {
                    pluginResult.then(_next).catch(cb);
                    return;
                }

                _next(pluginResult);
            };

        return new Promise((resolve, reject) => {
            next(tree, (err, tree) => {
                if (err) return reject(err);

                resolve({
                    html: render(tree, tree.options),
                    tree
                });
            });
        });
    }

    /**
     * Helper for call process in sync mode
     */
    processSync(tree, options = {}) {
        options.sync = true;
        return this.process(tree, options);
    }
}

export default plugins => new PostHTML(plugins);

/**
 * Checks the argument to be a Promise (or thenable) object.
 *
 * @param {*} p - Target object to test
 * @returns {Boolean}
 */
function isPromise(p) {
    return (p instanceof Promise) || (typeof p === 'object' && p.then && p.catch);
}

/**
 * Simple tryCatch helper
 *
 * @param {Function} tryFn - try block
 * @param {Function} catchFn - catch block
 * @returns {?*} - result if exists
 */
function tryCatch(tryFn, catchFn) {
    let res;
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
