import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../dist/index.mjs'

const text = 'text'

function test (html, reference, done) {
  posthtml()
    .process(html)
    .then(result => {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Parse text', () => {
  it('Text equal', done => {
    test(text, text, done)
  })
})
