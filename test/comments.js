const { readFileSync } = require('fs')
const path = require('path')

const { it, describe } = require('mocha')
const { expect } = require('chai')

const posthtml = require('../lib')

const comments = readFileSync(
  path.resolve(__dirname, 'templates/comments.html'), 'utf8'
)

function test (html, reference, done) {
  posthtml().process(html)
    .then(result => {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Parse comments', () => {
  it('comments equal', done => {
    test(comments, comments, done)
  })
})
