'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const input = '<div class="button"><rect /><div class="button__text">Text</div></div>'
const options = { singleTags: ['rect'], closingSingleTag: 'slash' }

function test (html, done) {
  posthtml()
    .process(html, options)
    .then((result) => {
      expect(input).to.eql(result.html)

      done()
    })
    .catch((err) => done(err))
}

describe('Set options', function () {
  it('html equal', function (done) {
    test(input, done)
  })
})

describe('Skip html parsing & use tree from options.', function () {
  const tree = [
    {
      tag: 'div',
      attrs: { class: 'button' },
      content: [
        { tag: 'rect' },
        {
          attrs: { class: 'button__text' },
          content: ['Text']
        }
      ]
    }
  ]

  it('Set use tree', function (done) {
    options.skipParse = true

    expect(posthtml()
      .process(tree, options)
      .then((result) => {
        expect(input).to.eql(result.html)

        done()
      })
      .catch((err) => done(err))
    )
  })
})

// TODO(michael-ciniawsky) enable when parser got curried
describe.skip('Set option', function () {
  const html = '<?php echo "Hello word"; ?>'
  const document = `<!doctype><html><body>${html}</body></html>`

  options.directives = [
    { name: '?php', start: '<', end: '>' }
  ]

  it.skip('directive ?php', function (done) {
    expect(posthtml()
      .process(html, options)
      .then((result) => {
        expect(html).to.eql(result.html)

        done()
      })
      .catch((err) => done(err))
    )
  })

  it.skip('directive ?php with multi html', function (done) {
    expect(posthtml()
      .process(document, options)
      .then((result) => {
        expect(document).to.eql(result.html)

        done()
      })
      .catch((err) => done(err))
    )
  })
})
