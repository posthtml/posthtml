import fs from 'fs';
import Api from './api.mjs'

import { parser } from 'posthtml-parser'
import { render, Node as RenderNode, Options as RenderOptions } from 'posthtml-render'
import { MaybeArray, Node, Options, Parser, Plugin, Render, Result } from './types.mjs';

const packageJson = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

/**
 * @author Ivan Voischev (@voischev),
 *         Ivan Demidov (@scrum)
 *
 * @requires api
 * @requires posthtml-parser
 * @requires posthtml-render
 *
 * @constructor PostHTML
 * @param {Array} plugins - An array of PostHTML plugins
 */
class PostHTML<TThis, TMessage> {
  version: string;
  name: string;
  plugins: Plugin<TThis>[];
  source: string;
  messages: TMessage[];
  parser: Parser;
  render: Render;
  options: Options;

  constructor (plugins?: Plugin<TThis>[]) {
  /**
   * PostHTML Instance
   *
   * @prop plugins
   * @prop options
   */
    this.version = packageJson.version;
    this.name = packageJson.name;
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || []
    this.source = ''

    /**
     * Tree messages to store and pass metadata between plugins
     *
     * @memberof tree
     * @type {Array} messages
     *
     * @example
     * ```js
     * export default function plugin (options = {}) {
     *   return function (tree) {
     *      tree.messages.push({
     *        type: 'dependency',
     *        file: 'path/to/dependency.html',
     *        from: tree.options.from
     *      })
     *
     *      return tree
     *   }
     * }
     * ```
     */
    this.messages = []

    /**
     * Tree method parsing string inside plugins.
     *
     * @memberof tree
     * @type {Function} parser
     *
     * @example
     * ```js
     * export default function plugin (options = {}) {
     *   return function (tree) {
     *      tree.match({ tag: 'include' }, function(node) {
     *          node.tag = false;
     *          node.content = tree.parser(fs.readFileSync(node.attr.src))
     *          return node
     *      })
     *
     *      return tree
     *   }
     * }
     * ```
     */
    this.parser = parser

    /**
     * Tree method rendering tree to string inside plugins.
     *
     * @memberof tree
     * @type {Function} render
     *
     * @example
     * ```js
     * export default function plugin (options = {}) {
     *    return function (tree) {
     *      var outherTree = ['\n', {tag: 'div', content: ['1']}, '\n\t', {tag: 'div', content: ['2']}, '\n'];
     *      var htmlWitchoutSpaceless = tree.render(outherTree).replace(/[\n|\t]/g, '');
     *      return tree.parser(htmlWitchoutSpaceless)
     *    }
     * }
     * ```
     */
    this.render = render

    // extend api methods
    Api.call(this);
  }

  /**
  * @this posthtml
  * @param   {Function} plugin - A PostHTML plugin
  * @returns {Constructor} - this(PostHTML)
  *
  * **Usage**
  * ```js
  * ph.use((tree) => { tag: 'div', content: tree })
  *   .process('<html>..</html>', {})
  *   .then((result) => result))
  * ```
  */
  use<TThis>(plugins: MaybeArray<Plugin<TThis>>): this {
    if (!Array.isArray(plugins)) {
      this.plugins.push(plugins)
    } else {
      this.plugins.push(...plugins);
    }
    return this
  }

  /**
   * @param   {string} html - Input (HTML)
   * @param   {Options | undefined} options - PostHTML Options
   * @returns Sync Mode
   * @returns Async Mode (default)
   *
   * **Usage**
   *
   * **Sync**
   * ```js
   * ph.process('<html>..</html>', { sync: true }).html
   * ```
   *
   * **Async**
   * ```js
   * ph.process('<html>..</html>', {}).then((result) => result))
   * ```
   */
  process(html: string, options: Options = {}): Promise<Result<TMessage>> | Result<TMessage> {
    this.options = options
    this.source = html;

    if (options.parser) this.parser = options.parser
    if (options.render) this.render = options.render

    let nodeOrNodes = options.skipParse ? html || [] : this.parser(html, options);

    let tree: Node[] = [].concat(nodeOrNodes);

    // sync mode
    if (options.sync === true) {
      this.plugins.forEach((plugin, index) => {
        _treeExtendApi(tree, this)

        let result: ReturnType<Plugin<TThis>> | undefined

        if (plugin.length === 2 || isPromise(result = plugin(tree as Node[]))) {
          throw new Error(
            `Can’t process contents in sync mode because of async plugin: ${plugin.name}`
          )
        }

        // clearing the tree of options
        if (index !== this.plugins.length - 1 && !options.skipParse) {
          tree = [].concat(tree)
        }

        // return the previous tree unless result is fulfilled
        tree = (result as Node[] | undefined) || tree
      })

      return lazyResult(this.render, tree)
    }

    // async mode
    let i = 0

    const next = (result: Node[], cb: (err: string | null, tree?: Node[]) => void) => {
      _treeExtendApi(result, this)

      // all plugins called
      if (this.plugins.length <= i) {
        cb(null, result)
        return
      }

      // little helper to go to the next iteration
      function _next (res: Node[]) {
        if (res && !options.skipParse) {
          res = [].concat(res)
        }

        return next(res || result, cb)
      }

      // call next
      const plugin = this.plugins[i++]

      if (plugin.length === 2) {
        // @ts-ignore the following assumes plugin receives a callback as second argument
        plugin(result, (err: string | null, res: Node[]) => {
          if (err) return cb(err)
          _next(res)
        })
        return
      }

      // sync and promised plugins
      let err = null

      const res = tryCatch(() => plugin(result), e => {
        err = e
        return e
      })

      if (err) {
        cb(err)
        return
      }

      if (isPromise(res)) {
        res.then(_next).catch(cb)
        return
      }

      _next(res)
    }

    return new Promise((resolve, reject) => {
      next(tree, (err, tree) => {
        if (err) reject(err)
        else resolve(lazyResult(this.render, tree))
      })
    })
  }
}

/**
 * @exports posthtml
 *
 * @param  plugins
 * @return The PostHTML instance
 *
 * **Usage**
 * ```js
 * import posthtml from 'posthtml'
 * import plugin from 'posthtml-plugin'
 *
 * const ph = posthtml([ plugin() ])
 * ```
 */
export default function posthtml<TThis, TMessage>(
    plugins?: Plugin<TThis>[]
): PostHTML<TThis, TMessage> {
  return new PostHTML(plugins)
}

/**
 * Extension of options tree
 *
 * @private
 *
 * @param   tree
 * @param   PostHTML
 */
function _treeExtendApi<TThis, TMessage>(
    tree: Node[],
    posthtml: PostHTML<TThis, TMessage>
) {
    if (typeof tree === 'object') {
        tree = Object.assign(tree, posthtml);
    }
}

/**
 * Checks if parameter is a Promise (or thenable) object.
 *
 * @private
 *
 * @param   promise - Target `{}` to test
 * @returns {boolean}
 */
function isPromise<T>(promise: any): promise is Promise<T> {
  return !!promise && typeof promise.then === 'function'
}

/**
 * Simple try/catch helper, if exists, returns result
 *
 * @private
 *
 * @param   tryFn - try block
 * @param   catchFn - catch block
 * @returns {any}
 */
function tryCatch (tryFn: () => any, catchFn: (e: any) => any): any {
  try {
    return tryFn()
  } catch (err) {
    catchFn(err)
  }
}

/**
 * Wraps the PostHTMLTree within an object using a getter to render HTML on demand.
 *
 * @private
 *
 * @param   render
 * @param   tree
 * @returns the result
 */
function lazyResult<TMessage>(render: Render, tree?: Node | Node[]): Result<TMessage> {
  return {
    get html () {
      return render(tree as RenderNode, "options" in tree ? tree["options"] as RenderOptions : undefined);
    },
    tree,
    messages: "messages" in tree ? tree.messages as TMessage[] : []
  }
}
