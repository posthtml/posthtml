var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var html = '<div class="messages">Messages</div>'
var messages = [
  {
    type: 'warning',
    file: './index.html',
    plugin: 'posthtml-plugin',
    message: "I'm a warning"
  },
  {
    type: 'error',
    file: './index.html',
    plugin: 'posthtml-plugin',
    message: "I'm an Error"
  },
  {
    type: 'dependency',
    file: 'path/to/1.html',
    from: './index.html'
  }
]

function test (html, done) {
  posthtml()
    .use(function (tree) {
      tree.warn('posthtml-plugin', 'I\'m a warning', false)

      return tree
    })
    .use(function (tree) {
      tree.error('posthtml-plugin', 'I\'m an Error', false)

      return tree
    })
    .use(function (tree) {
      tree.dependency('path/to/1.html')

      return tree
    })
    .process(html, { from: './index.html' })
    .then(function (result) {
      result.messages = result.messages.map(function (msg) {
        if (msg.message) {
          msg.message = typeof msg.message === 'function'
            ? msg.message()
            : msg.message
        }

        return msg
      })

      expect(html).to.eql(result.html)
      expect(messages).to.eql(result.messages)

      done()
    })
    .catch(function (error) {
      done(error)
    })
}

describe('Messages', function () {
  it('should expose messages via result.messages', function (done) {
    test(html, done)
  })
})
