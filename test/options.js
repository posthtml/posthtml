var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var input = '<div class="button"><rect /><div class="button__text">Text</div></div>'
var options = { singleTags: ['rect'], closingSingleTag: 'slash' }

function test (html, done) {
  posthtml()
    .process(html, options)
    .then(function (result) {
      expect(input).to.eql(result.html)
      done()
    })
    .catch(function (error) { return done(error) })
}

describe('Set options', function () {
  it('html equal', function (done) {
    test(input, done)
  })
})

describe('Skip html parsing & use tree from options.', function () {
  var tree = [
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
      .then(function (result) {
        expect(input).to.eql(result.html)
        done()
      })
      .catch(function (error) { return done(error) })
    )
  })
})

describe('Set option', function () {
  var html = '<?php echo "Hello word"; ?>'
  var multiHTML = '<!doctype><html><body>' + html + '</body></html>'

  options.directives = [
    { name: '?php', start: '<', end: '>' }
  ]

  it('directive ?php', function (done) {
    expect(posthtml()
      .process(html, options)
      .then(function (result) {
        expect(html).to.eql(result.html)
        done()
      })
      .catch(function (error) { return done(error) })
    )
  })

  it('directive ?php with multi html', function (done) {
    expect(posthtml()
      .process(multiHTML, options)
      .then(function (result) {
        expect(multiHTML).to.eql(result.html)
        done()
      })
      .catch(function (error) { return done(error) })
    )
  })
})
