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
    walk: function walk(cb) {
        traverse(this, node => cb(node));
    },
    /**
     * match expression for of his search in nodes of tree
     * @param  {*}        expression    Object/String... for search. Array is an enumeration expressions
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
     * }
     */
    match: function match(expression, cb) {
        Array.isArray(expression) ? this.walk(node => {
                for (let i = 0, len = expression.length; i < len; i++) {
                    if (compare(expression[i], node)) return cb(node);
                }
                return node;
            }) : this.walk(node => {
                if (compare(expression, node)) return cb(node);
                return node;
            });
    },
    /**
     * each className
     * @param  {Strinig}  className     Class name for search
     * @param  {Function} cb            Callbak function
     * @return {Function}               Node in callback
     *
     * Examples use:
     * module.exports = function (tree) {
     *     tree.matchClass('custom-class', function(node) {
     *         // do something for node
     *         return node;
     *     });
     * }
     */
    matchClass: function matchClass(className, cb) {
        this.match({ attrs: { class: true }}, node => {
            let classes = node.attrs.class.split(' ');
            if (classes.includes(className)) {
                return cb(node);
            }
            return node;
        });
    }
};

function traverse(tree, cb) {
    if (Array.isArray(tree)) {
        for (let i = 0, l = tree.length; i < l; i++) {
            let item = tree[i];
            if (typeof item !== 'object') {
                tree[i] = traverse(item, cb);
            } else {
                tree[i] = traverse(cb(item), cb);
            }
        }
    } else if (typeof tree === 'object') {
        if (tree.hasOwnProperty('content')) traverse(tree.content, cb);
    } else {
        return cb(tree);
    }
    return tree;
}

function compare(expected, actual) {
    if (typeof actual !== typeof expected) {
        return false;
    }

    if (typeof expected !== 'object' || expected === null) {
        return expected === actual;
    }

    if (!!expected && !actual) {
        return false;
    }

    if (Array.isArray(expected)) {
        if (typeof actual.length !== 'number') {
            return false;
        }
        let aa = Array.prototype.slice.call(actual);
        return expected.every(exp => aa.some(act => compare(exp, act)));
    }

    return Object.keys(expected).every(key => {
        let eo = expected[key];
        let ao = actual[key];
        if (typeof eo === 'object' && eo !== null && ao !== null) {
            return compare(eo, ao);
        }
        if (typeof eo === 'boolean') {
            return (eo && ao) || (!eo && !ao);
        }
        return ao === eo;
    });
}
