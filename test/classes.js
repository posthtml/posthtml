var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

function test (html, reference, done) {
  posthtml().process(html)
    .then(function (result) {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(function (error) { return done(error) })
}

describe('Parse classes', function () {
  it('div', function (done) {
    var html = '<div></div>'
    test(html, html, done)
  })

  it('block1', function (done) {
    var html = '<div class="block1">text</div>'
    test(html, html, done)
  })

  it('block1 block2', function (done) {
    var html = '<div class="block1 block2">text</div>'
    test(html, html, done)
  })
})
