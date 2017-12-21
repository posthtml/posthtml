var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var html = null

function test (html, done) {
  posthtml()
    .use(function (tree) {
      tree.walk(function (node) { return node })
      tree.match(/(.+)/, function (node) { return node })

      tree.messages.push({
        type: 'warning',
        message: 'tree is empty'
      })

      return tree
    })
    .process(html, { skipParse: true })
    .then(function (result) {
      expect('').to.eql(result.html)

      done()
    })
    .catch(function (error) {
      done(error)
    })
}

describe('Process', function () {
  it('should not throw on empty tree', function (done) {
    test(html, done)
  })
})
