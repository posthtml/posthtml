var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var text = 'text'

function test (html, reference, done) {
  posthtml()
    .process(html)
    .then(function (result) {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(function (error) { return done(error) })
}

describe('Parse text', function () {
  it('Text equal', function (done) {
    test(text, text, done)
  })
})
