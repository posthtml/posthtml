'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const html = '<div class="button"><div class="button__text">Text</div></div>'

function test (html, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(html).to.eql(result.html)

      done()
    })
    .catch((err) => done(err))
}

describe('Text', function () {
  it('Equal', function (done) {
    test(html, done)
  })
})
