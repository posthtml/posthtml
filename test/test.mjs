import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../dist/index.mjs'

const input = '<div class="button"><div class="button__text">Text</div></div>'

function test (html, done) {
  posthtml()
    .process(html)
    .then(result => {
      expect(input).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Simple text', () => {
  it('html eqval', done => {
    test(input, done)
  })
})
