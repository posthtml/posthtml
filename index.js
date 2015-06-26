var Promise = require('bluebird'),
    bh = new (require('bh').BH)(),
    buildBemJson = require('html2bemjson');

bh.setOptions({
    // add SVG short tags

    // FIXME(@voischev): @veribigman это что?
    shortTags : ['rect']
});

module.exports = function posthtml() {

    return new (function() {

        this.parse = function(html) {
            return [buildBemJson.convert(html)];
        };

        this.plugins = [];

        this.use = function(plugin) {
            this.plugins.push(plugin);

            return this;
        };

        this.process = function(html) {
            var _this = this;

            return new Promise(function(resolve) {

                var tree = _this.parse(html);

                _this.plugins.forEach(function(plugin) {
                    tree = plugin(tree);
                });

                var bemjson = bh.processBemJson(tree);

                resolve(bh.apply(bemjson));
            });
        };
    })();
};
