const test = require('ava')
const path = require('path')
const fs = require('fs')
const posthtml = require('..')
const customElements = require('posthtml-custom-elements')
const fixtures = path.join(__dirname, 'fixtures')

test('basic', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'basic.html'))

  posthtml({ plugins: [customElements()] })
    .process(html)
    .then((res) => {
      t.truthy(res.output === '<div class="custom">hi</div>\n')
      t.truthy(res.options)
      t.truthy(res.runtime)
    })
})

test.todo('custom parser')
test.todo('custom generator')
test.todo('parser options')
test.todo('generator options')
test.todo('options override to process method')
test.todo('single plugin')
test.todo('multi plugin')
