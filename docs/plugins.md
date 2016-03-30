# PostHTML Plugins
## Create
This is a simple function with a single argument.

> Use [posthtml-plugin-boilerplate][plugin-boilerplate] boilerplate for create new plugin.

### Synchronous plugin example

```js
module.exports = function pluginName(tree) {
    // do something for tree
    tree.match({ tag: 'img' }, function(node) {
        node = Object.assign(node, { attrs: { class: 'img-wrapped' } });
        return {
            tag: 'span',
            attrs: { class: 'img-wrapper' },
            content: node
        }
    });
};
```

### Classic asynchronous plugin example

```js
var request = request('request');
module.exports = function pluginName(tree, cb) {
    var tasks = 0;
    tree.match({ tag: 'a' }, function(node) {
        // skip local anchors
        if (!/^(https?:)?\/\//.test(node.attrs.href)) {
            return node;
        }
        request.head(node.attrs.href, function (err, resp) {
            if (err) return done();
            if (resp.statusCode >= 400) {
                node.attrs.class += ' ' + 'Erroric';
            }
            if (resp.headers.contentType) {
                node.attrs.class += ' content-type_' + resp.headers.contentType;
            }
            done();
        });
        tasks += 1;
        return node;
    });
    function done() {
        tasks -= 1;
        if (!tasks) cb(null, tree);
    }
};
```

### Promised asynchronous plugin example

```js
import parser from 'posthtml-parser';
import request from 'request';

export default tree => {
    return new Promise(resolve => {
        tree.match({ tag: 'user-info' }, (node) => {
            request(`/api/user-info?${node.attrs.dataUserId}`, (err, resp, body) {
                if (!err && body) node.content = parser(body);
                resolve(tree);
            });
        });
    });
};
```

[plugin-boilerplate]: https://github.com/jonathantneal/posthtml-plugin-boilerplate
