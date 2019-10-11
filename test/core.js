var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

describe('core methods', function () {

  it('tree should have methods', function () {
    posthtml()
      .use(function (tree) {
        tree.should.have.property('render')
        tree.should.have.property('parser')
        tree.toString.should.be.a('function')
      })
      .process('<div></div>')
  })

  it('core methods parser', function (done) {
    var html = '<import>'
    var ref = '<div>import</div>'

    posthtml()
      .use(function (tree) {
        tree.match({ tag: 'import' }, function (node) {
          node.tag = false
          node.content = tree.parser('<div>import</div>')
          return node
        })
        return tree
      })
      .process(html)
      .then(function (result) {
        expect(ref).to.eql(result.html)

        done()
      })
      .catch(function (error) {
        done(error)
      })
  })

  it('core methods render', function (done) {
    var html = '\n<div>1</div>\n\t<div>2</div>\n'
    var ref = '<div>1</div><div>2</div>'

    posthtml()
      .use(function (tree) {
        var outherTree = ['\n', { tag: 'div', content: ['1'] }, '\n\t', { tag: 'div', content: ['2'] }, '\n']
        var htmlWitchoutSpaceless = tree.render(outherTree).replace(/[\n|\t]/g, '')
        return tree.parser(htmlWitchoutSpaceless)
      })
      .process(html)
      .then(function (result) {
        expect(ref).to.eql(result.html)

        done()
      })
      .catch(function (error) {
        done(error)
      })
  })
})
