var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var input = '<div class="messages">Messages</div>'

var error = { type: 'error', plugin: 'posthtml-plugin', message: 'Error' }
var warning = { type: 'warning', plugin: 'posthtml-plugin', message: 'Warning' }
var dependency = { type: 'dependency', file: 'path/to/file.html' }

var messages = [ error, warning, dependency ]

function test (html, done) {
  posthtml()
    .use(function (tree) {
      tree.error('posthtml-plugin', 'Error')
      tree.warning('posthtml-plugin', 'Warning')
      tree.dependency('path/to/file.html')
    })
    .process(html)
    .then(function (result) {
      expect(input).to.eql(result.html)
      expect(messages).to.eql(result.messages)

      done()
    })
    .catch(function (error) {
      done(error)
    })
}

describe('Messages', function () {
  it('should contain error(s), warning(s) && dependencies', function (done) {
    test(input, done)
  })
})
