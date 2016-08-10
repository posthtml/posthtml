var fs = require('fs')
var path = require('path')

var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var parser = require('posthtml-parser')
var render = require('posthtml-render')

var html = fs.readFileSync(
  path.resolve(__dirname, 'templates/parser.html'), 'utf8'
)

describe('Parser', function () {
  it('parser => render', function (done) {
    expect(html).to.eql(render(parser(html)))
    done()
  })
})
