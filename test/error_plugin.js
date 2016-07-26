module.exports = function (tree, {PluginError}) {
  if (tree[0].content[0].content === 'hi') {
    throw new PluginError({
      message: 'Greetings not permitted',
      plugin: 'NoGreetingsPlugin',
      location: tree[0].content[0].location
    })
  }
  return tree
}
