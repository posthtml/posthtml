export default {
    /**
     * walk for all nodes and return node in callbak
     * @param  {Function} cb            Callbak function
     * @return {Function}               Node in callback
     *
     * Examples use:
     * module.exports = function (tree) {
     *     tree.walk(function(node) {
     *         let classes = node.attrs && node.attrs.class.split(' ') || [];
     *             if(classes.includes(className)) {
     *                 return cb(node);
     *             }
     *             return node;
     *         }
     *     });
     * }
     */
    walk(cb) {
        traverse(this, node => cb(node));
    },
    /**
     * match expression for of his search in nodes of tree
     * @param  {String|RegExp|Object|Array.<String|RegExp|Object>} expression - Matcher(s) to search
     * @param  {Function} cb            Callbak function
     * @return {Function}               Node in callback
     *
     * Examples use:
     * module.exports = function (tree) {
     *     tree.match({ tag: 'custom-tag' }, function(node) {
     *         var tag = node.tag;
     *         node = Object.assign(node, { tag: 'div', attrs: { class: tag } }});
     *         return node
     *     });
     *
     *     // Array matchers
     *     tree.match([{ tag: 'b' }, { tag: 'strong' }], function(node) {
     *         var style = 'font-weight: bold;';
     *         node.tag = 'span';
     *         node.attrs ? (
     *             node.attrs.style ? (
     *                 node.attrs.style += style
     *             ) : node.attrs.style = style;
     *         ) : node.attrs = { style: style };
     *         return node
     *     });
     * }
     */
    match(expression, cb) {
        Array.isArray(expression) ? this.walk(node => {
                for (let i = 0, len = expression.length; i < len; i++) {
                    if (compare(expression[i], node)) return cb(node);
                }
                return node;
            }) : this.walk(node => {
                if (compare(expression, node)) return cb(node);
                return node;
            });
    }
};

/** @private */
function traverse(tree, cb) {
    if (Array.isArray(tree)) {
        for (let i = 0, l = tree.length; i < l; i++) {
            tree[i] = traverse(cb(tree[i]), cb);
        }
    } else if (typeof tree === 'object' && tree.hasOwnProperty('content'))  traverse(tree.content, cb);
    return tree;
}

/** @private */
function compare(expected, actual) {
    if (expected instanceof RegExp) {
        if (typeof actual === 'object') return false;
        if (typeof actual === 'string') return expected.test(actual);
    }

    if (typeof expected !== typeof actual) return false;
    if (typeof expected !== 'object' || expected === null) return expected === actual;

    if (Array.isArray(expected)) {
        let aa = Array.prototype.slice.call(actual);
        return expected.every(exp => aa.some(act => compare(exp, act)));
    }

    return Object.keys(expected).every(key => {
        let eo = expected[key];
        let ao = actual[key];
        if (typeof eo === 'object' && eo !== null && ao !== null) return compare(eo, ao);
        if (typeof eo === 'boolean') return (eo && ao) || (!eo && !ao);
        return ao === eo;
    });
}
