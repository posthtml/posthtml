import buildBemJson from 'html2bemjson';

var tmpl = new (require('bh').BH);

class Posthtml {

    constructor(options) {

        let opt = options || {},
            { tmplOptions, skipParse } = opt,
            plugins = [];

        /**
         * Get options
         * @return {Object} options or {}
         */
        this.getOptions = function() {
            return opt;
        };

        /**
         * Parse html to json tree
         * @param  {String} html htmltree
         * @return {String} json jsontree
         */
        this.parse = function(html) {
            return [buildBemJson.convert(html)];
        };

        /**
         * use plagins
         * @param  {function} plugin posthtml().use(plugin());
         */
        this.use = function(plugin) {
            plugins.push(plugin);
            return this;
        };

        /**
         * @param  {String} nodes html/json tree
         * @return {[type]}      [description]
         */
        this.process = function(nodes) {

            let _this = this;

            tmplOptions && tmpl.setOptions(tmplOptions);

            return new Promise(function(resolve) {

                let tree = skipParse ? nodes : _this.parse(nodes);

                plugins.forEach(function(plugin) {
                    tree = plugin(tree);
                });

                let json = tmpl.processBemJson(tree);

                resolve(tmpl.apply(json));
            });
        };
    }
}

export default function posthtml(options) {
    return new Posthtml(options);
};
