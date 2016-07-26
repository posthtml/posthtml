const api = {
  // TODO this should be deprecated
  walk: function (cb) { this.map(cb) }
}

module.exports = (tree) => Object.assign(tree, api)
