import buildBemJson from 'html2bemjson';

var tmpl = new (require('bh').BH);

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
        return [buildBemJson.convert(html)];
    }

    /**
     * use plugins
     * @param  {function} plugin posthtml().use(plugin());
     */
    use(plugin) {
        this.plugins.push(plugin);
        return this;
    };

    /**
     * @param  {String} tree  html/json tree
     * @param {Object} options Options obj
     * @return {Object}        result
     */
    process(tree, { tmplOptions, skipParse } = {}) {

        tmplOptions && tmpl.setOptions(tmplOptions);

        return new Promise(resolve => {

            tree = skipParse ? tree : this.parse(tree);

            this.plugins.forEach(plugin => {
                let result = plugin(tree);

                if(result) {
                    tree = result;
                }
            });
            /**
             * Get options process
             * @return {Object}
             */
            let getOptions = () => ({ tmplOptions, skipParse });

            let html = tmpl.apply(tmpl.processBemJson(tree));

            resolve({ html, tree, getOptions });
        });
    };

}

export default plugins => new Posthtml(plugins);
