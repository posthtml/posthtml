var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var input = '<div class="button"><div class="button__text">Text</div></div>'

function test (html, done) {
  posthtml()
    .process(html)
    .then(function (result) {
      expect(input).to.eql(result.html)
      done()
    })
    .catch(function (error) { return done(error) })
}

describe('Simple text', function () {
  it('html eqval', function (done) {
    test(input, done)
  })
})
