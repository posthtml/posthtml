var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var html = '<div class="source">source</div>'
var expected = '<div>source</div>'

function test (html, done) {
  posthtml()
    .use(function (tree) {
      return tree.walk(node => {
        if (node.attrs) {
          delete node.attrs.class
        }

        return node
      })
    })
    .process(html)
    .then(function (result) {
      expect(html).to.eql(result.tree.source)
      expect(expected).to.eql(result.html)
      done()
    })
    .catch(function (error) {
      done(error)
    })
}

describe('Source', function () {
  it('Source code must not mutate', function (done) {
    test(html, done)
  })
})
