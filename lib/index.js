const parser = require('posthtml-parser')
const generator = require('posthtml-render')
const Joi = require('joi')
const W = require('when')
const merge = require('lodash.merge')

/**
 * @class PostHTML
 */
class PostHTML {
  /**
   * Constructs a new instance of the class, validates and sets options.
   * @constructor
   * @see PostHTML#_validate for info on options
   * @param {Object} options - options object
   */
  constructor (options = {}) {
    this.options = this._validate(options)
  }

  /**
   * Process the input through the function, return the output as a promise.
   * Accepts options, merged with constructor options with priority.
   * @param {String} input - a string of html to be processed
   * @param {Object} options - full options as in the constructor
   */
  process (input, options = {}) {
    options = merge(this.options, this._validate(options))
    const ast = parser(input, options.parserOptions)
    const ctx = { options, runtime: {} }
    return W.reduce(this.plugins, (m, plugin) => plugin.call(ctx, m), ast)
      .then((modifiedAst) => generator(modifiedAst, options.generatorOptions))
      .then((output) => { return {output, ctx} })
  }

  /**
   * Validate the options object.
   * @private
   * @param {Object} options - options object
   * @param {Array|Function} [options.plugins] - array of plugin functions
   * @param {Function} [options.parser] - replace the default parser
   * @param {Function} [options.generator] - replace the default code generator
   * @param {Object} [options.parserOptions] - options to pass to the parser
   * @param {Object} [options.generatorOptions] - options to pass to the codegen
   */
  _validate (opts) {
    const schema = Joi.object().keys({
      plugins: Joi.array().single().items(Joi.func()).default([]),
      parser: Joi.func().default(parser),
      generator: Joi.func().default(generator),
      parserOptions: Joi.object(),
      generatorOptions: Joi.object()
    })
    return Joi.validate(opts, schema).value
  }
}

module.exports = (options) => new PostHTML(options)