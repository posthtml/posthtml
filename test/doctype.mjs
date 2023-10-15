import { readFileSync } from 'fs'
import { resolve } from 'path'

import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../lib/index.mjs'

const doctype = readFileSync(
  resolve(__dirname, 'templates/doctype.html'), 'utf8'
)

function test (html, reference, done) {
  posthtml().process(html)
    .then(result => {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Parse Doctype', () => {
  it('doctype equal', done => {
    test(doctype, doctype, done)
  })
})
