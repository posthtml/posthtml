var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

// eslint-disable-next-line
var html = '<div>${ hello }</div>'
var template = '<div>Hello World!</div>'

function test (html, done) {
  posthtml()
    .process(html)
    .then(function (result) {
      const locals = { hello: 'Hello World!' }

      expect(result.template(locals)).to.eql(template)

      done()
    })
    .catch(function (error) {
      done(error)
    })
}

describe('Templates', function () {
  it('should interpolate ES2015 Literals in HTML templates', function (done) {
    test(html, done)
  })
})
