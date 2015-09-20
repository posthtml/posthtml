import { toTree, toHtml } from './parser.js';

import api from './api.js';

class Posthtml {

    constructor(plugins = []) {
        this.plugins = plugins;
    }

    /**
     * Parse html to json tree
     * @param  {String} html htmltree
     * @return {String} json jsontree
     */
    parse(html) {
        return toTree(html);
    }

    /**
     * use plugins
     * @param  {function} plugin posthtml().use(plugin());
     */
    use(plugin) {
        this.plugins.push(plugin);
        return this;
    }

    /**
     * @param  {String} tree  html/json tree
     * @param {Object} options Options obj
     * @return {Object}        result
     */
    process(tree, { tmplOptions, skipParse } = {}) {

        return new Promise(resolve => {

            tree = skipParse ? tree : this.parse(tree);

            for(let key in api) {
                tree[key] = api[key];
            }

            this.plugins.forEach(plugin => {
                let result = plugin(tree);

                if(result) {
                    tree = result;
                }
            });

            resolve({
                html: toHtml(tree, tmplOptions),
                tree
            });
        });
    }

}

export default plugins => new Posthtml(plugins);
