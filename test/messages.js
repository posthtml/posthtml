var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var html = '<div class="messages">Messages</div>'
var messages = [
  {
    type: 'dependency',
    file: './path/to/1.html',
    from: undefined
  },
  {
    type: 'dependency',
    file: './path/to/2.html',
    from: undefined
  }
]

function test (html, done) {
  posthtml()
    .use(function (tree) {
      tree.messages.push({
        type: 'dependency',
        file: './path/to/1.html',
        from: tree.options.from
      })

      return tree
    })
    .use(function (tree) {
      tree.messages.push({
        type: 'dependency',
        file: './path/to/2.html',
        from: tree.options.from
      })

      return tree
    })
    .process(html)
    .then(function (result) {
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
