var htmlparser = require('htmlparser2'),
    bemNaming = require('bem-naming'),
    vm = require('vm');

function isEmpty(obj) {
    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }

    return true;
}

var convert = function(html) {
    var bufArray = [],
        results = {};

    bufArray.last = function() {
        return this[this.length - 1];
    };

    var parser = new htmlparser.Parser({
        onopentag: function(tag, attrs) {
            var buf = {},
                classes = attrs.class && attrs.class.split(' '),
                block = classes && bemNaming.parse(classes.shift()),
                i;

            for (i in block) {
                buf[i] = block[i];
            }

            if (classes && classes.length) {
                classes.map(bemNaming.parse).forEach(function(entity) {
                    if (entity.block === buf.block && entity.modName) {
                        buf.mods || (buf.mods = {});
                        buf.mods[entity.modName] = entity.modVal;
                    } else {
                        buf.mix = (buf.mix || []).concat(entity);
                    }
                });
            }

            delete attrs.class;

            var js = attrs['data-bem'] || attrs.onclick;

            if (js) {
                js = js.replace(/&quot;/g, '\'');
                js = js.replace(/^return/, '');
                js = vm.runInNewContext('(' + js + ')');

                if (js[block.block]) {
                    if (isEmpty(js[block.block])) {
                        buf.js = true;
                    } else {
                        buf.js = js[block.block];
                    }
                }
                delete js[block.block];

                Object.keys(js).forEach(function(prop) {
                    buf.mix.forEach(function(entity, idx) {
                        if (entity.block && entity.block == prop) {
                            if (isEmpty(js[prop])) {
                                buf.mix[idx].js = true;
                            } else {
                                buf.mix[idx].js = js[prop];
                            }
                        }
                    });
                });

                delete attrs['data-bem'];
                delete attrs.onclick;
            }

            if (tag != 'div') {
                buf.tag = tag;
            }

            if (!isEmpty(attrs)) buf.attrs = attrs;

            bufArray.push(buf);
        },
        onclosetag: function(tag) {
            var buf = bufArray.pop();
            if (bufArray.length === 0) {
                return results = buf;
            }
            var last = bufArray.last();
            if (!(last.content instanceof Array)) {
                last.content = [];
            }
            last.content.push(buf);
        },
        ontext: function(text) {
            if (text.match(/(^\n|^\n\s+$)/g)) return;

            var last = bufArray.last();
            if (!last) return;

            last.content = last.content || [];
            last.content.push(text);
        }
    });

    parser.write(html);
    parser.end();

    return results;
};

exports.convert = convert;
