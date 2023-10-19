import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../dist/index.mjs'

const html = '<div class="messages">Messages</div>'
const expected = '<new-root><div class="messages">Messages</div></new-root>'
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
    .use(tree => {
      tree.messages.push({
        type: 'dependency',
        file: './path/to/1.html',
        from: tree.options.from
      })
      return tree
    })
    .use(tree => {
      tree.messages.push({
        type: 'dependency',
        file: './path/to/2.html',
        from: tree.options.from
      })

      return tree
    })
    .use(tree => ({
      tag: 'new-root',
      content: tree
    }))
    .process(html)
    .then(result => {
      expect(expected).to.eql(result.html)
      expect(messages).to.eql(result.messages)

      done()
    })
    .catch(error => {
      done(error)
    })
}

describe('Messages', () => {
  it('should expose messages via result.messages', done => {
    test(html, done)
  })
})
