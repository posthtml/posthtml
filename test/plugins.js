var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe
var beforeEach = require('mocha').beforeEach

var posthtml = require('../lib')

describe('Plugins', function () {
  var html = '<div class="button"><div class="button__text">Text</div></div>'
  var tree

  beforeEach(function () {
    tree = [
      {
        tag: 'div',
        attrs: {
          class: 'button'
        },
        content: [
          {
            tag: 'div',
            attrs: {
              class: 'button__text'
            },
            content: [
              'Text'
            ]
          }
        ]
      }
    ]
  })

  describe('posthtml([plugins])', function () {
    it('options default', function () {
      return posthtml([ function (json) { return json } ])
        .process(html, {})
        .should.eventually.containSubset({ html: html })
    })

    it('should return original for resultless plugins', function () {
      return posthtml([ function (json) {} ])
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ tree: tree })
    })

    it('set options skipParse', function () {
      return posthtml([ function (json) { return json } ])
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ tree: tree, html: html })
    })
  })

  describe('posthtml(plugins)', function () {
    it('options default', function () {
      return posthtml(function (json) { return json })
        .process(html, {})
        .should.eventually.containSubset({ html: html })
    })
  })

  describe('.use(plugin)', function () {
    it('options default', function () {
      return posthtml()
        .use(function (json) { return json })
        .use(function (json) {})
        .process(html, {})
        .should.eventually.containSubset({ html: html })
    })

    it('set options skipParse', function () {
      return posthtml()
        .use(function (json) { return json })
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ html: html })
    })

    it('is variadic method', function () {
      return posthtml()
        .use(function (json) { json.x++ }, function (json) { json.x += 2 })
        .process({ x: 1 }, { skipParse: true })
        .should.eventually.containSubset({ tree: { x: 4 } })
    })

    it('should not reassign plugins array', function () {
      var ph = posthtml().use(function () {}, function () {})
      var plugins = ph.plugins

      ph.use(function () {}, function () {})
      expect(ph.plugins).to.eql(plugins)
    })
  })

  describe('sync mode', function () {
    it('should run plugins sync-ly', function () {
      posthtml([ function (json) { return json } ])
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ html: html, tree: tree })
    })

    it('should flow sync-ly', function () {
      posthtml()
        .use(function () { return { x: '1' } })
        .use(function (json) { return { x: json.x + '2' } })
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ tree: { x: '12' } })
    })

    it('should flow the same object sync-ly', function () {
      posthtml()
        .use(function (json) { json.x = '1'; return json })
        .use(function (json) { json.x += '2'; return json })
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ tree: { x: '12' } })
    })

    it('should throw on async plugin with callback', function () {
      function foobarPlugin (json, cb) { cb(null, json) }

      var ph = posthtml()

      ph.use(foobarPlugin)
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/Can’t process contents in sync mode because of async plugin: foobarPlugin/)
    })

    it('should throw on async plugin with Promise', function () {
      function foobarPlugin (json) {
        return new Promise(function (resolve) {
          return resolve(json)
        })
      }

      var ph = posthtml()

      ph.use(foobarPlugin)
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/Can’t process contents in sync mode because of async plugin: foobarPlugin/)
    })

    it('should catch plugin runtime throws', function () {
      var ph = posthtml()

      ph.use(function () { throw new Error('FooBar') })
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/FooBar/)
    })

    it('should have api methods after returning new root', function () {
      posthtml()
        .use(function (tree) {
          return { tag: 'new-root', content: tree }
        })
        .use(function (tree) {
          tree.should.have.property('walk')
          tree.should.have.property('match')
          tree.walk.should.be.a('function')
        })
        .process('<div></div>', { sync: true })
    })
  })

  describe('async mode', function () {
    it('should flow async-ly', function () {
      return posthtml()
        .use(function () { return { x: '1' } })
        .use(function (json, cb) { cb(null, { x: json.x + '2' }) })
        .use(function (json) {
          return Promise.resolve({ x: json.x + '3' })
        })
        .use(function (json) {
          return new Promise(function (resolve) {
            setImmediate(resolve, { x: json.x + '4' })
          })
        })
        .use(function (json) { return { x: json.x + '5' } })
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ tree: { x: '12345' } })
    })

    it('should flow the same object async-ly', function () {
      return posthtml()
        .use(function (json) { json.x = '1' })
        .use(function (json, cb) { json.x += '2'; cb() })
        .use(function (json) {
          json.x += '3'
          return Promise.resolve()
        })
        .use(function (json) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              json.x += '4'
              resolve()
            }, 50)
          })
        })
        .use(function (json) { json.x += '5' })
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ tree: { x: '12345' } })
    })

    it('should catch plugin runtime throws and transform it to rejects',
      function () {
        return posthtml()
          .use(function () { throw new Error('FooBar') })
          .process(tree, { skipParse: true })
          .should.be.rejectedWith(Error, /FooBar/)
      }
    )

    it('should transform callback errors to rejects', function () {
      posthtml()
        .use(function (_, cb) { cb(new Error('FooBar')) })
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /FooBar/)
    })

    it('should pass other rejects', function () {
      posthtml()
        .use(function () { return Promise.reject(new Error('FooBar')) })
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /FooBar/)
    })

    it('should have api methods after returning new root', function () {
      posthtml()
        .use(function (tree) {
          return Promise.resolve({ tag: 'new-root', content: tree })
        })
        .use(function (tree) {
          tree.should.have.property('walk')
          tree.should.have.property('match')
          tree.walk.should.be.a('function')
        })
        .process('<div></div>')
    })
  })

  describe('other options', function () {
    it('should modify options in plugin runtime', function () {
      var html = '<div class="cls"><br><rect></div>'
      var ref = '<div class="cls"><br /><rect /></div>'

      return posthtml()
        .use(function (tree) {
          tree.options.singleTags = ['rect']
          tree.options.closingSingleTag = 'slash'
        })
        .process(html)
        .should.eventually.containSubset({
          html: ref,
          tree: [{
            tag: 'div',
            attrs: { class: 'cls' },
            content: [ { tag: 'br' }, { tag: 'rect' } ]
          }]
        })
    })
  })
})
