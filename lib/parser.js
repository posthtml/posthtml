/*jshint -W082 */
import htmlparser from 'htmlparser2';
import { walk } from '../lib/api.js';

export default {
    /**
     * Parse html to PostHTML tree
     * @param  {String} html
     * @return {Object}
     */
    toTree: function (html) {
        let bufArray = [],
            results = [];

        bufArray.last = function() {
            return this[this.length - 1];
        };

        let parser = new htmlparser.Parser({
            onprocessinginstruction: function(name, data) {
                name === '!doctype' && results.push(`<${data}>`);
            },
            oncomment: function(data) {
                let comment = `<!--${ data }-->`,
                    last = bufArray.last();

                if (!last) {
                    results.push(comment);
                    return;
                }

                last.content || (last.content = []);
                last.content.push(comment);
            },
            onopentag: function(tag, attrs) {
                let buf = {};

                buf.tag = tag;

                if (!isEmpty(attrs)) buf.attrs = attrs;

                if (isEmpty(buf)) buf = { content: '' };

                bufArray.push(buf);
            },
            onclosetag: function() {
                let buf = bufArray.pop();

                if (bufArray.length === 0) {
                    results.push(buf);

                    return;
                }

                let last = bufArray.last();
                if (!(last.content instanceof Array)) {
                    last.content = [];
                }
                last.content.push(buf);
            },
            ontext: function(text) {
                let last = bufArray.last();
                if (!last) {
                    results.push(text);
                    return;
                }

                last.content || (last.content = []);
                last.content.push(text);
            }
        });

        parser.write(html);
        parser.end();

        return results;
    },
    /**
     * Parse PostHTML tree to html
     * @param  {Object} tree    PostHTML tree
     * @param  {Object} options Parse options
     * @return {String}         html string
     */
    toHtml: function (tree, options = {}) {

        /**
         * options parse
         * @param {Array}  singleTags           single tags array for extend default
         * @param {String} closingSingleTag     option for closing single tag
         *                                      Option:
         *                                          default: `<br>`
         *                                          slash: `<br/>`
         *                                          tag: `<br></br>`
         *
         */

        let { singleTags: optSingleTags, closingSingleTag } = tree.options || options;

        const SINGLE_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen',
                            'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
        let singleTags = {};

        for (let i = 0, len = SINGLE_TAGS.length; i < len; i++) {
            singleTags[SINGLE_TAGS[i]] = 1;
        }

        if (optSingleTags) {
            for (let i = 0, len = optSingleTags.length; i < len; i++) {
                singleTags[optSingleTags[i]] = 1;
            }
        }

        return html(tree);

        function html (tree) {

            if(typeof(tree) === 'string') {
                return tree;
            }

            let buf = '';

            walk.call([].concat(tree), node => {
                if(!node) return;
                if(typeof(node) === 'string') {
                    buf += node;
                    return;
                }
                let tag = node.tag || 'div';
                if (singleTags[tag]) {
                    buf += `<${tag}${attrs(node.attrs)}`;
                    switch(closingSingleTag) {
                        case 'slash':
                            buf += `/>`;
                            break;
                        case 'tag':
                            buf += `></${tag}>`;
                            break;
                        default:
                            buf += `>`;
                    }
                } else {
                    buf += `<${ tag }${
                            node.attrs ?
                            attrs(node.attrs) :
                            ''
                        }>${
                            node.content ?
                            html(node.content) :
                            ''
                        }</${ tag }>`;
                }
            });

            return buf;

            function attrs (obj) {
                let attr = '';
                for (let key in obj) {
                    attr += ` ${key}="${obj[key]}"`;
                }
                return attr;
            }
        }
    }
};

function isEmpty(obj) {
    for(let key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }

    return true;
}
