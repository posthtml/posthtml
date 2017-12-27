'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

function test (html, reference, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(reference).to.eql(result.html)
      done()
    })
    .catch((err) => done(err))
}

describe('Classes', function () {
  it('div', function (done) {
    const html = '<div></div>'

    test(html, html, done)
  })

  it('block1', function (done) {
    const html = '<div class="block1">text</div>'

    test(html, html, done)
  })

  it('block1 block2', function (done) {
    const html = '<div class="block1 block2">text</div>'

    test(html, html, done)
  })
})
