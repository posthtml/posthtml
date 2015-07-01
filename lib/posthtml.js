import buildBemJson from 'html2bemjson';

var tmpl = new (require('bh').BH);

class Posthtml {

    constructor(plugins) {

        plugins = plugins || [];

        /**
         * Parse html to json tree
         * @param  {String} html htmltree
         * @return {String} json jsontree
         */
        this.parse = function(html) {
            return [buildBemJson.convert(html)];
        };

        /**
         * use plugins
         * @param  {function} plugin posthtml().use(plugin());
         */
        this.use = function(plugin) {
            plugins.push(plugin);
            return this;
        };

        /**
         * @param  {String} tree  html/json tree
         * @param {Object} options Options obj
         * @return {Object}        result
         */
        this.process = function(tree, options) {

            options = options || {};

            let _this = this,
                { tmplOptions, skipParse } = options;

            tmplOptions && tmpl.setOptions(tmplOptions);

            return new Promise(function(resolve) {

                tree = skipParse ? tree : _this.parse(tree);

                plugins.forEach(function(plugin) {
                    tree = plugin(tree);
                });

                let result = {
                    html: tmpl.apply(tmpl.processBemJson(tree)),
                    tree: tree,
                    /**
                     * Get options process
                     * @return {Object}
                     */
                    getOptions: function() {
                        return options;
                    }
                };

                resolve(result);
            });
        };
    }
}

export default function posthtml(plugins) {
    return new Posthtml(plugins);
};
