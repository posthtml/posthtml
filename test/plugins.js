'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe
const beforeEach = require('mocha').beforeEach

const posthtml = require('../lib')

describe('Plugins', function () {
  const html = `<div class="button"><div class="button__text">Text</div></div>`

  let tree

  beforeEach(() => {
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
        .use((json) => json)
        .use((json) => {})
        .process(html, {})
        .should.eventually.containSubset({ html: html })
    })

    it('set options skipParse', function () {
      return posthtml()
        .use((json) => json)
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ html: html })
    })

    it('is variadic method', function () {
      return posthtml()
        .use((json) => { json.x++ }, (json) => { json.x += 2 })
        .process({ x: 1 }, { skipParse: true })
        .should.eventually.containSubset({ tree: { x: 4 } })
    })

    it('should not reassign plugins array', function () {
      var ph = posthtml().use(() => {}, () => {})

      var plugins = ph.plugins

      ph.use(() => {}, () => {})

      expect(ph.plugins).to.eql(plugins)
    })
  })

  describe('sync mode', function () {
    it('should run plugins sync-ly', function () {
      posthtml([
        function (json) { return json }
      ])
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ html: html, tree: tree })
    })

    it('should flow sync-ly', function () {
      posthtml()
        .use(() => ({ x: '1' }))
        .use((json) => ({ x: json.x + '2' }))
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ tree: { x: '12' } })
    })

    it('should flow the same object sync-ly', function () {
      posthtml()
        .use((json) => { json.x = '1'; return json })
        .use((json) => { json.x += '2'; return json })
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ tree: { x: '12' } })
    })

    it('should throw on async plugin with callback', function () {
      function plugin (json, cb) {
        cb(null, json)
      }

      const ph = posthtml()

      ph.use(plugin)
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/Can’t process contents in sync mode because of async plugin: plugin/)
    })

    it('should throw on async plugin with Promise', function () {
      function plugin (json) {
        return new Promise((resolve) => {
          return resolve(json)
        })
      }

      const ph = posthtml()

      ph.use(plugin)
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/Can’t process contents in sync mode because of async plugin: plugin/)
    })

    it('should catch plugin runtime throws', function () {
      const ph = posthtml()

      ph.use(() => { throw new Error('PluginError') })
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/PluginError/)
    })

    it('should have API methods after returning new root', function () {
      posthtml()
        .use((tree) => {
          return {
            tag: 'new-root',
            content: tree
          }
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
        .use(() => ({ x: '1' }))
        .use((json, cb) => { cb(null, { x: json.x + '2' }) })
        .use((json) => {
          return Promise.resolve({ x: json.x + '3' })
        })
        .use((json) => {
          return new Promise(function (resolve) {
            setImmediate(resolve, { x: json.x + '4' })
          })
        })
        .use((json) => { return { x: json.x + '5' } })
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ tree: { x: '12345' } })
    })

    it('should flow the same object async-ly', function () {
      return posthtml()
        .use((json) => { json.x = '1' })
        .use((json, cb) => { json.x += '2'; cb() })
        .use((json) => {
          json.x += '3'

          return Promise.resolve()
        })
        .use((json) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              json.x += '4'
              resolve()
            }, 50)
          })
        })
        .use((json) => { json.x += '5' })
        .process(tree, { skipParse: true })
        .should.eventually.containSubset({ tree: { x: '12345' } })
    })

    it('should catch plugin runtime throws and transform it to rejects',
      function () {
        return posthtml()
          .use(() => { throw new Error('PluginError') })
          .process(tree, { skipParse: true })
          .should.be.rejectedWith(Error, /PluginError/)
      }
    )

    it('should transform callback errors to rejects', function () {
      posthtml()
        .use((_, cb) => { cb(new Error('PluginError')) })
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /PluginError/)
    })

    it('should pass other rejects', function () {
      posthtml()
        .use(() => { return Promise.reject(new Error('PluginError')) })
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /PluginError/)
    })

    it('should have api methods after returning new root', function () {
      posthtml()
        .use((tree) => {
          return Promise.resolve({ tag: 'new-root', content: tree })
        })
        .use((tree) => {
          tree.should.have.property('walk')
          tree.should.have.property('match')
          tree.walk.should.be.a('function')
        })
        .process('<div></div>')
    })
  })

  describe('other options', function () {
    it('should modify options in plugin runtime', function () {
      const html = '<div class="cls"><br><rect></div>'
      const ref = '<div class="cls"><br /><rect /></div>'

      return posthtml()
        .use((tree) => {
          tree.options.singleTags = ['rect']
          tree.options.closingSingleTag = 'slash'
        })
        .process(html)
        .should.eventually.containSubset({
          html: ref,
          tree: [{
            tag: 'div',
            attrs: { class: 'cls' },
            content: [
              { tag: 'br' },
              { tag: 'rect' }
            ]
          }]
        })
    })
  })
})
