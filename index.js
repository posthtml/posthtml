var Promise = require('bluebird'),
    buildBemJson = require('html2bemjson');

module.exports = function posthtml() {

    return new function() {

        this.parse = function(html) {
            return [buildBemJson.convert(html)];
        }

        this.plugins = [];

        this.use = function(plugin) {
            this.plugins.push(plugin);

            return this;
        }

        this.process = function(html) {
            var _this = this;

            return new Promise(function(resolve, reject) {

                var tree = _this.parse(html);

                _this.plugins.forEach(function(plugin) {
                    tree = plugin(tree);
                });

                resolve(tree);
            });
        }
    }
}
