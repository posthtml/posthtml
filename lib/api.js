'use strict';

module.exports = {
    /**
     * walk the tree and pass all nodes to callback
     * @param  {Function} cb            Callback function
     * @return {Function}               Node in callback
     *
     * Example usage:
     * module.exports = function(tree) {
     *     tree.walk(function(node) {
     *         var classes = node.attrs && node.attrs.class.split(' ') || [];
     *         if (classes.includes(className)) return cb(node);
     *         return node;
     *     });
     * };
     */
    walk: function(cb) {
        return traverse(this, cb);
    },
    /**
     * match expression to search nodes in the tree
     * @param  {String|RegExp|Object|Array.<String|RegExp|Object>} expression -
     *                                      Matcher(s) to search
     * @param  {Function} cb            Callback function
     * @return {Function}               Node in callback
     *
     * Example usage:
     * module.exports = function(tree) {
     *     tree.match({ tag: 'custom-tag' }, function(node) {
     *         var tag = node.tag;
     *         Object.assign(node, { tag: 'div', attrs: {class: tag} });
     *         return node;
     *     });
     *
     *     // Array matchers
     *     tree.match([{ tag: 'b' }, { tag: 'strong' }], function(node) {
     *         var style = 'font-weight: bold;';
     *         node.tag = 'span';
     *         node.attrs ? (
     *             node.attrs.style ? (
     *                 node.attrs.style += style
     *             ) : node.attrs.style = style
     *         ) : node.attrs = { style: style };
     *         return node;
     *     });
     * };
     */
    match: function(expression, cb) {
        return Array.isArray(expression) ? traverse(this, function(node) {
                for (var i = 0; i < expression.length; i++) {
                    if (compare(expression[i], node)) return cb(node);
                }
                return node;
            }) : traverse(this, function(node) {
                if (compare(expression, node)) return cb(node);
                return node;
            });
    }
};

/** @private */
function traverse(tree, cb) {
    if (Array.isArray(tree)) {
        for (var i = 0; i < tree.length; i++) {
            tree[i] = traverse(cb(tree[i]), cb);
        }
    } else if (
        tree &&
        typeof tree === 'object' &&
        tree.hasOwnProperty('content')
    )  traverse(tree.content, cb);
    return tree;
}

/** @private */
function compare(expected, actual) {
    if (expected instanceof RegExp) {
        if (typeof actual === 'object')
            return false;
        if (typeof actual === 'string')
            return expected.test(actual);
    }

    if (typeof expected !== typeof actual)
        return false;
    if (typeof expected !== 'object' || expected === null)
        return expected === actual;

    if (Array.isArray(expected)) {
        return expected.every(function(exp) {
            return [].some.call(actual, function(act) {
                return compare(exp, act);
            });
        });
    }

    return Object.keys(expected).every(function(key) {
        var eo = expected[key];
        var ao = actual[key];
        if (typeof eo === 'object' && eo !== null && ao !== null)
            return compare(eo, ao);
        if (typeof eo === 'boolean')
            return eo !== (ao == null);
        return ao === eo;
    });
}
