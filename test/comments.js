'use strict'

const fs = require('fs')
const path = require('path')

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const comments = fs.readFileSync(
  path.resolve(__dirname, 'templates/comments.html'), 'utf8'
)

function test (html, reference, done) {
  posthtml().process(html)
    .then((result) => {
      expect(reference).to.eql(result.html)

      done()
    })
    .catch((err) => done(err))
}

describe('Comments', function () {
  it('Equal', function (done) {
    test(comments, comments, done)
  })
})
