import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../lib'

function test (html, reference, done) {
  posthtml().process(html)
    .then(result => {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Parse classes', () => {
  it('div', done => {
    const html = '<div></div>'
    test(html, html, done)
  })

  it('block1', done => {
    const html = '<div class="block1">text</div>'
    test(html, html, done)
  })

  it('block1 block2', done => {
    const html = '<div class="block1 block2">text</div>'
    test(html, html, done)
  })
})
