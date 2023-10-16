/* eslint-disable import/no-commonjs */

const { it, describe } = require('mocha')
const { expect } = require('chai')

const posthtml = require('../lib/index.cjs')

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

describe('[Commonjs] Simple text', () => {
  it('html eqval', done => {
    test(input, done)
  })
})
