const test = require('ava')
const path = require('path')
const fs = require('fs')
const posthtml = require('..')
const customElements = require('posthtml-custom-elements')
const exp = require('posthtml-exp')
const sugarml = require('sugarml')
const codegen = require('posthtml-code-gen')
const parser2 = require('posthtml-parser2')
const errorPlugin = require('./error_plugin')
const fixtures = path.join(__dirname, 'fixtures')
const PostHtmlError = posthtml.PostHtmlError

test('basic', (t) => {
  return process('basic.html', { plugins: [customElements()] }).then((res) => {
    t.truthy(res.output === '<div class="custom">hi</div>\n')
    t.truthy(res.plugins)
    t.truthy(res.runtime)
  })
})

test('custom parser', (t) => {
  return process('sugarml.html', { parser: sugarml }).then((res) => {
    t.truthy(res.output.trim() === '<p>hello world!</p>')
  })
})

test('custom generator', (t) => {
  return process('basic.html', {
    parser: parser2,
    generator: codegen
  }).then((res) => {
    t.truthy(res.output().trim() === '<custom>hi</custom>')
  })
})

test('parser options', (t) => {
  return process('upcase.html', {
    parserOptions: { lowerCaseTags: true }
  }).then((res) => {
    t.truthy(res.output.trim() === '<div>hi</div>')
  })
})

test('generator options', (t) => {
  return process('selfclosing.html', {
    parser: parser2,
    generator: codegen,
    generatorOptions: { selfClosing: 'slash' }
  }).then((res) => {
    t.truthy(res.output().trim() === '<br />')
  })
})

test('options override to process method', (t) => {
  return process('basic.html', { plugins: [customElements()] }, {
    plugins: [(x) => x]
  }).then((res) => {
    t.truthy(res.output.trim() === '<custom>hi</custom>')
  })
})

test('multi plugin', (t) => {
  return process('expression.html', {
    plugins: [customElements(), exp({ locals: { foo: 'bar' } })]
  }).then((res) => {
    t.truthy(res.output.trim() === '<div class="custom">bar</div>')
  })
})

test('error', (t) => {
  const err = new PostHtmlError({
    src: '<p>{{ foo -}</p>',
    location: { line: 1, col: 10 },
    filename: '/Sites/foo/index.html',
    message: 'invalid close delimiter',
    plugin: 'posthtml-expressions'
  }).toString()
  t.truthy(err === 'PostHtmlError: invalid close delimiter\nFrom Plugin: posthtml-expressions\nLocation: /Sites/foo/index.html:1:10\n\n<p>{{ foo -}</p>\n         ^\n')
})

test('plugin error', (t) => {
  const PluginError = PostHtmlError.generatePluginError({
    src: 'foo bar',
    filename: '/foo/bar/wow'
  })
  const err = new PluginError({
    location: { line: 1, col: 4 },
    plugin: 'testPlugin',
    message: 'test'
  }).toString()
  t.truthy(err === 'PostHtmlPluginError: test\nFrom Plugin: testPlugin\nLocation: /foo/bar/wow:1:4\n\nfoo bar\n   ^\n')
})

test('plugin error within a plugin', (t) => {
  return process('basic.html', {
    filename: path.join(fixtures, 'basic.html'),
    parser: parser2,
    plugins: [errorPlugin]
  }).then(() => {
    t.fail('plugin should throw an error and it doesn\'t')
  }).catch((res) => {
    t.truthy(res.toString() === 'PostHtmlPluginError: Greetings not permitted\nFrom Plugin: NoGreetingsPlugin\nLocation: /Users/jeff/Sites/posthtml/test/fixtures/basic.html:1:9\n\n<custom>hi</custom>\n        ^\n')
  })
})

function process (file, config, config2) {
  const html = fs.readFileSync(path.join(fixtures, file), 'utf8')
  return posthtml(config).process(html, config2)
}
