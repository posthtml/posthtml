'use strict'

const fs = require('fs')
const path = require('path')

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const doctype = fs.readFileSync(
  path.resolve(__dirname, 'templates/doctype.html'), 'utf8'
)

function test (html, reference, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(reference).to.eql(result.html)

      done()
    })
    .catch((err) => done(err))
}

describe('Parse Doctype', function () {
  it('doctype equal', function (done) {
    test(doctype, doctype, done)
  })
})
