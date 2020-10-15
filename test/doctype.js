const { readFileSync } = require('fs')
const path = require('path')

const { it, describe } = require('mocha')
const { expect } = require('chai')

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
  it('doctype equal', done => {
    test(doctype, doctype, done)
  })
})
