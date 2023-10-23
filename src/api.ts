export default function Api() {
  this.walk = walk;
  this.match = match;
}

export function walk(cb) {
  return traverse(this, cb);
}

export function match(expression, cb) {
  return Array.isArray(expression)
    ? traverse(this, (node) => {
        for (let i = 0; i < expression.length; i++) {
          if (compare(expression[i], node)) return cb(node);
        }

        return node;
      })
    : traverse(this, (node) => {
        if (compare(expression, node)) return cb(node);

        return node;
      });
}

function traverse(tree, cb) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      tree[i] = traverse(cb(tree[i]), cb);
    }
  } else if (tree && typeof tree === "object" && Object.prototype.hasOwnProperty.call(tree, "content"))
    traverse(tree.content, cb);

  return tree;
}

function compare(expected, actual) {
  if (expected instanceof RegExp) {
    if (typeof actual === "object") return false;
    if (typeof actual === "string") return expected.test(actual);
  }

  if (typeof expected !== typeof actual) return false;
  if (typeof expected !== "object" || expected === null) {
    return expected === actual;
  }

  if (Array.isArray(expected)) {
    return expected.every((exp) => [].some.call(actual, (act) => compare(exp, act)));
  }

  return Object.keys(expected).every((key) => {
    const ao = actual[key];
    const eo = expected[key];

    if (typeof eo === "object" && eo !== null && ao !== null) {
      return compare(eo, ao);
    }
    if (typeof eo === "boolean") {
      return eo !== (ao == null);
    }

    return ao === eo;
  });
}
