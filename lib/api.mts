'use strict'

import { AttrMatcher, Expression, Maybe, MaybeArray, Node, NodeAttributes, NodeCallback, RawNode, StringMatcher } from "./types.mjs"

/**
 * # API
 *
 * @author Ivan Voischev (@voischev),
 *         Anton Winogradov (@awinogradov),
 *         Alexej Yaroshevich (@zxqfox),
 *         Vasiliy (@Yeti-or)
 *
 * @namespace tree
 */
export default function Api () {
  this.walk = walk
  this.match = match
}

/**
 * Walks the tree and passes all nodes via a callback
 *
 * @memberof tree
 *
 * @param  cb  Callback
 * @return     Callback(node)
 *
 *@example
 * ```js
 * export const walk = (tree) => {
 *   tree.walk((node) => {
 *     let classes = node.attrs && node.attrs.class.split(' ') || []
 *
 *     if (classes.includes(className)) return cb(node)
 *       return node
 *   })
 * }
 * ```
 */
export function walk (cb: NodeCallback): Node | Node[] {
  return traverse(this, cb)
}

/**
 * Matches an expression to search for nodes in the tree
 *
 * @memberof tree
 *
 * @param  {String|RegExp|Object|Array} expression - Matcher(s) to search
 * @param  {Function} cb Callback
 *
 * @return {Function} Callback(node)
 *
 * @example
 * ```js
 * export const match = (tree) => {
 *   // Single matcher
 *   tree.match({ tag: 'custom-tag' }, (node) => {
 *     let tag = node.tag
 *
 *     Object.assign(node, { tag: 'div', attrs: {class: tag} })
 *
 *     return node
 *   })
 *   // Multiple matchers
 *   tree.match([{ tag: 'b' }, { tag: 'strong' }], (node) => {
 *     let style = 'font-weight: bold;'
 *
 *     node.tag = 'span'
 *
 *     node.attrs
 *       ? ( node.attrs.style
 *         ? ( node.attrs.style += style )
 *         : node.attrs.style = style
 *       )
 *       : node.attrs = { style: style }
 *
 *     return node
 *   })
 * }
 * ```
 */
export function match<
    TTag extends StringMatcher,
    TAttrs extends Maybe<AttrMatcher>,
    TTagResult extends Maybe<string> = TTag extends string
        ? TTag
        : TTag extends void
        ? Maybe<string>
        : string,
    TAttrResult extends Maybe<NodeAttributes> = TAttrs extends void
        ? Maybe<NodeAttributes>
        : {
              [P in keyof TAttrs]: string;
          } & NodeAttributes
>(
    expression: Expression<TTag, TAttrs>,
    cb: NodeCallback<TTagResult, TAttrResult>
): Node<TTagResult, TAttrResult>[] {
  return Array.isArray(expression)
    ? traverse(this, (node: Node<TTagResult, TAttrResult>) => {
        for (let i = 0; i < expression.length; i++) {
          if (compare(expression[i], node)) return cb(node)
        }

        return node
      })
    : traverse(this, (node: Node<TTagResult, TAttrResult>) => {
      if (compare(expression, node)) return cb(node)

      return node
    })
}


/** @private */
function traverse<
    TTag extends Maybe<string> = Maybe<string>,
    TAttrs extends Maybe<NodeAttributes> = Maybe<NodeAttributes>,
>(
  tree: MaybeArray<Node<TTag, TAttrs>>,
  cb: NodeCallback<TTag, TAttrs>
): Array<Node<TTag, TAttrs>> {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      tree[i] = traverse(cb(tree[i]) as MaybeArray<Node>, cb) as unknown as Node<TTag, TAttrs>;
    }
  } else if (
    tree &&
      typeof tree === 'object' &&
      Object.prototype.hasOwnProperty.call(tree, 'content') &&
      'content' in tree
  ) {
    traverse(tree["content"] as Node[], cb)
  }

  return tree as Array<Node<TTag, TAttrs>>
}

/** @private */
function compare <
  TTag extends StringMatcher,
  TAttrs extends Maybe<AttrMatcher>,
  TTagResult extends Maybe<string>,
  TAttrResult extends Maybe<NodeAttributes>
>(
  expected: Expression<TTag, TAttrs>,
  actual: Node<TTagResult, TAttrResult>
) {
  if (expected instanceof RegExp) {
    if (typeof actual === 'object') return false
    if (typeof actual === 'string') return expected.test(actual)
  }

  if (typeof expected !== typeof actual) return false
  if (typeof expected !== 'object' || expected === null) {
    // @ts-ignore
    return expected === actual
  }

  if (Array.isArray(expected)) {
    return expected.every(exp => [].some.call(actual, act => compare(exp, act)))
  }

  return Object.keys(expected).every(key => {
    const ao = actual[key]
    const eo = expected[key]

    if (typeof eo === 'object' && eo !== null && ao !== null) {
      return compare(eo, ao)
    }
    if (typeof eo === 'boolean') {
      return eo !== (ao == null)
    }

    return ao === eo
  })
}
