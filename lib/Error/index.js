const code = require('./frame')

class PluginError extends Error {
  constructor (err) {
    super(err)

    this.name = err.name
    this.message = err.location ? code(err) : err.message

    if (!err.stack) this.stack = false

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = PluginError
