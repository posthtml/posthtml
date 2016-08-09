module.exports = function (tree, {PluginError}) {
  if (tree[0].content[0].content === 'hi') {
    throw new PluginError({
      plugin: 'NoGreetingsPlugin',
      message: 'Greetings not permitted',
      location: tree[0].content[0].location
    })
  }
  return tree
}
