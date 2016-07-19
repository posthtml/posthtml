const test = require('ava')
const path = require('path')
const fs = require('fs')
const posthtml = require('..')
const customElements = require('posthtml-custom-elements')
const exp = require('posthtml-exp')
const sugarml = require('sugarml')
const codegen = require('posthtml-code-gen')
const fixtures = path.join(__dirname, 'fixtures')

test('basic', (t) => {
  process('basic.html', { plugins: [customElements()] }).then((res) => {
    t.truthy(res.output === '<div class="custom">hi</div>\n')
    t.truthy(res.options)
    t.truthy(res.runtime)
  })
})

test('custom parser', (t) => {
  process('sugarml.html', { parser: sugarml }).then((res) => {
    t.truthy(res.output.trim() === '<p>hello world!</p>')
  })
})

test('custom generator', (t) => {
  process('basic.html', { generator: codegen }).then((res) => {
    t.truthy(res.output() === '<custom>hi</custom>')
  })
})

test('parser options', (t) => {
  process('upcase.html', {
    parserOptions: { lowerCaseTags: true }
  }).then((res) => {
    t.truthy(res.output === '<div>hi</div>')
  })
})

// right now generator options not working correctly
test.skip('generator options', (t) => {
  process('selfclosing.html', {
    generator: codegen,
    generatorOptions: { selfClosing: 'slash' }
  }).then((res) => {
    t.truthy(res.output() === '<br />')
  })
})

test('options override to process method', (t) => {
  process('basic.html', { plugins: [customElements()] }, {
    plugins: [(x) => x]
  }).then((res) => {
    t.truthy(res.output === '<custom>hi</custom>')
  })
})

test('multi plugin', (t) => {
  process('expression.html', {
    plugins: [customElements(), exp({ locals: { foo: 'bar' } })]
  }).then((res) => {
    t.truthy(res.output.trim() === '<div class="custom">bar</div>')
  })
})

function process (file, config, config2) {
  const html = fs.readFileSync(path.join(fixtures, file), 'utf8')
  return posthtml(config).process(html, config2)
}
