const { readFileSync } = require('fs')
const path = require('path')

import {  describe, expect, it } from 'vitest';

const posthtml = require('../lib')

const doctype = readFileSync(
  path.resolve(__dirname, 'templates/doctype.html'), 'utf8'
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
  it('doctype equal', () => new Promise(done => {
    test(doctype, doctype, done)
  }))
})
