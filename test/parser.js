var fs = require('fs')
var path = require('path')

var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var parser = require('posthtml-parser')
var render = require('posthtml-render')

var carser = function (html) { return parser(html) }
var cender = function (tree) { return render(tree) }

var posthtml = require('../lib')

var input = fs.readFileSync(
  path.resolve(__dirname, 'templates/parser.html'), 'utf8'
)

function test (html, done) {
  posthtml()
    .process(html, { parser: carser, render: cender })
    .then(function (result) {
      expect(input).to.eql(result.html)
      done()
    })
    .catch(function (error) { return done(error) })
}

describe('Parser', function () {
  it('parser => render', function (done) {
    expect(input).to.eql(render(parser(input)))
    done()
  })
})

describe('Custom Parser', function () {
  it('carser => cender', function (done) {
    test(input, done)
  })
})
