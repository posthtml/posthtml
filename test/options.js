var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var input = '<div class="button"><rect /><div class="button__text">Text</div></div>'

function test (html, done) {
  var options = { singleTags: ['rect'], closingSingleTag: 'slash' }
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

describe('Skip html parsing & ', function () {
  var options = { skipParse: true }

  it('use number tree.', function (done) {
    var tree = 123456789
    expect(posthtml()
      .process(tree, options)
      .then(function (result) {
        expect('123456789').to.eql(result.html)
        done()
      })
      .catch(function (error) { return done(error) })
    )
  })

  it('use string tree.', function (done) {
    var tree = '123456789'
    expect(posthtml()
      .process(tree, options)
      .then(function (result) {
        expect('123456789').to.eql(result.html)
        done()
      })
      .catch(function (error) { return done(error) })
    )
  })
})

describe('Skip html parsing & use tree from options.', function () {
  var options = { singleTags: ['rect'], closingSingleTag: 'slash' }
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
  var options = { singleTags: ['rect'], closingSingleTag: 'slash' }
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
