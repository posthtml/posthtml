const { it, describe } = require('mocha')
const { expect } = require('chai')

const posthtml = require('../lib')

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
