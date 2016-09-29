var fs = require('fs')
var path = require('path')

var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var comments = fs.readFileSync(
  path.resolve(__dirname, 'templates/comments.html'), 'utf8'
)

function test (html, reference, done) {
  posthtml().process(html)
    .then(function (result) {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(function (error) { return done(error) })
}

describe('Parse comments', function () {
  it('comments equal', function (done) {
    test(comments, comments, done)
  })
})
