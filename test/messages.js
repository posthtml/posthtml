'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const html = '<div class="messages">Messages</div>'
const messages = [
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
    .use((tree) => {
      tree.messages.push({
        type: 'dependency',
        file: './path/to/1.html',
        from: tree.options.from
      })

      return tree
    })
    .use((tree) => {
      tree.messages.push({
        type: 'dependency',
        file: './path/to/2.html',
        from: tree.options.from
      })

      return tree
    })
    .process(html)
    .then((result) => {
      expect(html).to.eql(result.html)
      expect(messages).to.eql(result.messages)

      done()
    })
    .catch((err) => done(err))
}

describe('Messages', function () {
  it('should expose messages via result.messages', function (done) {
    test(html, done)
  })
})
