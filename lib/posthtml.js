import { toTree, toHtml } from './parser.js';
import api from './api.js';

export default plugins => new PostHTML(plugins);

export class PostHTML {

    constructor(plugins = []) {
        this.plugins = plugins;
    }
    /**
     * Parse html to json tree
     * @param {String} html htmltree
     * @returns {PostHTMLTree} json jsontree
     */
    static parse(html) {
        return toTree(html);
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
     * @param {String|HTMLTree} tree - html/json tree
     * @param {?Object} options - Options object
     * @param {?Boolean} options.skipParse - to prevent parsing incoming tree
     * @param {?Boolean} options.sync - to run plugins syncronously, will throw if there are async plugins
     * @returns {Promise<{html: String, tree: PostHTMLTree}>|{html: String, tree: PostHTMLTree}} - result
     */
    process(tree, options = {}) {
        tree = options.skipParse ? tree : PostHTML.parse(tree);
        tree.options = options;

        for (let key in api) {
            tree[key] = api[key];
        }

        // sync mode
        if (options.sync === true) {
            this.plugins.forEach(plugin => {
                let result;
                if (plugin.length === 2 || isPromise(result = plugin(tree))) {
                    throw new Error(`Can't process synchronously because of async plugin: ${plugin.name}`);
                }
                tree = result || tree;
            });

            return {
                html: toHtml(tree),
                tree
            };
        }

        // async mode
        let i = 0,
            tryc = (a, b) => { let res; try { res = a(); } catch (e) { b(e); } return res; },
            next = (res, cb) => {
                // all plugins called
                if (this.plugins.length <= i) {
                    cb(null, res);
                    return;
                }

                let _next = pluginResult => next(pluginResult || res, cb);

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
                let pluginResult = tryc(() => plugin(res), (e) => err = e);
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
                    html: toHtml(tree),
                    tree
                });
            });
        });
    }
}

/**
 * Checks the argument to be a Promise (or thenable) object.
 *
 * @param {*} p - Target object to test
 * @returns {Boolean}
 */
function isPromise(p) {
    return (p instanceof Promise) || (typeof p === 'object' && p.then && p.catch);
}
