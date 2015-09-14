/*jshint -W082 */
import htmlparser from 'htmlparser2';

function toTree (html) {

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
            let comment = `<!-- ${ data.trim() } -->`,
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
}

export default {
    toTree: toTree
};

function isEmpty(obj) {
    for(let key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }

    return true;
}
