import pkg from "../package.json";
import Api from "./api.js";

import { parser as posthtmlParser } from "posthtml-parser";
import { render as posthtmlRender } from "posthtml-render";

let parser = posthtmlParser;
let render = posthtmlRender;

class PostHTML {
  constructor(plugins) {
    this.version = pkg.version;
    this.name = pkg.name;
    this.plugins = typeof plugins === "function" ? [plugins] : plugins || [];
    this.source = "";
    this.messages = [];
    this.parser = parser;
    this.render = render;

    Api.call(this);
  }
  use(...args) {
    this.plugins.push(...args);

    return this;
  }
  process(tree, options = {}) {
    this.options = options;
    this.source = tree;

    if (options.parser) parser = this.parser = options.parser;
    if (options.render) render = this.render = options.render;

    tree = options.skipParse ? tree || [] : parser(tree, options);

    tree = [].concat(tree);

    if (options.sync === true) {
      this.plugins.forEach((plugin, index) => {
        _treeExtendApi(tree, this);

        let result;

        if (plugin.length === 2 || isPromise((result = plugin(tree)))) {
          throw new Error(`Can’t process contents in sync mode because of async plugin: ${plugin.name}`);
        }

        if (index !== this.plugins.length - 1 && !options.skipParse) {
          tree = [].concat(tree);
        }

        tree = result || tree;
      });

      return lazyResult(render, tree);
    }

    let i = 0;

    const next = (result, cb) => {
      _treeExtendApi(result, this);

      if (this.plugins.length <= i) {
        cb(null, result);
        return;
      }
      function _next(res) {
        if (res && !options.skipParse) {
          res = [].concat(res);
        }

        return next(res || result, cb);
      }

      const plugin = this.plugins[i++];

      if (plugin.length === 2) {
        plugin(result, (err, res) => {
          if (err) return cb(err);
          _next(res);
        });
        return;
      }

      let err = null;

      const res = tryCatch(
        () => plugin(result),
        (e) => {
          err = e;
          return e;
        },
      );

      if (err) {
        cb(err);
        return;
      }

      if (isPromise(res)) {
        res.then(_next).catch(cb);
        return;
      }

      _next(res);
    };

    return new Promise((resolve, reject) => {
      next(tree, (err, tree) => {
        if (err) reject(err);
        else resolve(lazyResult(render, tree));
      });
    });
  }
}

export default (plugins) => new PostHTML(plugins);

function _treeExtendApi(t, _t) {
  if (typeof t === "object") {
    t = Object.assign(t, _t);
  }
}

function isPromise(promise) {
  return !!promise && typeof promise.then === "function";
}

function tryCatch(tryFn, catchFn) {
  try {
    return tryFn();
  } catch (err) {
    catchFn(err);
  }
}

function lazyResult(render, tree) {
  return {
    get html() {
      return render(tree, tree.options);
    },
    tree,
    messages: tree.messages,
  };
}
