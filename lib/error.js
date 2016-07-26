const codeFrame = require('babel-code-frame')

class PostHtmlError extends Error {
  constructor (config) {
    super(config.message)

    this.name = this.constructor.name
    this.line = config.location.line
    this.col = config.location.col
    this.filename = config.location.filename || config.filename
    this.src = config.src
    this.plugin = config.plugin
    this.message = this._formatMessage()

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(config.message)).stack
    }
  }

  toJSON () {
    return {
      message: this.message,
      line: this.line,
      col: this.col,
      filename: this.filename,
      plugin: this.plugin
    }
  }

  _formatMessage () {
    const res = []
    res.push(this.message)
    if (this.plugin) res.push(`\nFrom Plugin: ${this.plugin}`)
    res.push('\n')
    res.push(`Location: `)
    if (this.filename) {
      res.push(`${this.filename}:`)
    } else {
      res.push('[no filename]:')
    }
    res.push(`${this.line}:${this.col}`)
    if (this.src) {
      res.push('\n\n')
      res.push(codeFrame(this.src, this.line, this.col))
      res.push('\n')
    }
    return res.join('')
  }
}

module.exports = PostHtmlError

module.exports.generatePluginError = (defaults) => {
  class PostHtmlPluginError extends PostHtmlError {
    constructor (config) { super(Object.assign(defaults, config)) }
  }
  return PostHtmlPluginError
}
