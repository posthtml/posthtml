import { readFileSync } from 'fs'

import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../lib/index.mjs'

const comments = readFileSync(
    new URL('./templates/comments.html', import.meta.url),
    'utf8'
);

function test (html, reference, done) {
  posthtml().process(html)
    .then(result => {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Parse comments', () => {
  it('comments equal', done => {
    test(comments, comments, done)
  })
})
