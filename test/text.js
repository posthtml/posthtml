'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const text = 'text'

function test (html, reference, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(reference).to.eql(result.html)

      done()
    })
    .catch((err) => done(err))
}

describe('Parse Text', function () {
  it('Equal', function (done) {
    test(text, text, done)
  })
})
