import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../dist/index.mjs'

const html = '<div class="source">source</div>'
const expected = '<div>source</div>'

function test (html, done) {
  posthtml()
    .use(tree => tree.walk(node => {
      if (node.attrs) {
        delete node.attrs.class
      }

      return node
    }))
    .process(html)
    .then(result => {
      expect(html).to.eql(result.tree.source)
      expect(expected).to.eql(result.html)
      done()
    })
    .catch(error => {
      done(error)
    })
}

describe('Source', () => {
  it('Source code must not mutate', done => {
    test(html, done)
  })
})
