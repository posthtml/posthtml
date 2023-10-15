import { it, describe, beforeEach } from 'mocha'
import { expect } from 'chai'

import posthtml from '../lib/index.mjs'

describe('Plugins', () => {
  const html = '<div class="button"><div class="button__text">Text</div></div>'
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

  describe('posthtml([plugins])', () => {
    it('options default', () => posthtml([json => json])
      .process(html, {})
      .should.eventually.containSubset({ html }))

    it('should return original for resultless plugins', () => posthtml([json => {}])
      .process(tree, { skipParse: true })
      .should.eventually.containSubset({ tree }))

    it('set options skipParse', () => posthtml([json => json])
      .process(tree, { skipParse: true })
      .should.eventually.containSubset({ tree, html }))
  })

  describe('posthtml(plugins)', () => {
    it('options default', () => posthtml(json => json)
      .process(html, {})
      .should.eventually.containSubset({ html }))
  })

  describe('.use(plugin)', () => {
    it('options default', () => posthtml()
      .use(json => json)
      .use(json => {})
      .process(html, {})
      .should.eventually.containSubset({ html }))

    it('set options skipParse', () => posthtml()
      .use(json => json)
      .process(tree, { skipParse: true })
      .should.eventually.containSubset({ html }))

    // Skip because the tree should always be an array
    it.skip('is variadic method', () => posthtml()
      .use(json => { json.x++ }, json => { json.x += 2 })
      .process({ x: 1 }, { skipParse: true })
      .should.eventually.containSubset({ tree: { x: 4 } }))

    it('should not reassign plugins array', () => {
      const ph = posthtml().use(() => {}, () => {})
      const plugins = ph.plugins

      ph.use(() => {}, () => {})
      expect(ph.plugins).to.eql(plugins)
    })
  })

  describe('sync mode', () => {
    it('should run plugins sync-ly', () => {
      posthtml([json => json])
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ html, tree })
    })

    it('should flow sync-ly', () => {
      posthtml()
        .use(() => ({
          x: '1'
        }))
        .use(({ x }) => ({
          x: `${x}2`
        }))
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ tree: { x: '12' } })
    })

    it('should flow the same object sync-ly', () => {
      posthtml()
        .use(json => { json.x = '1'; return json })
        .use(json => { json.x += '2'; return json })
        .process(tree, { skipParse: true, sync: true })
        .should.containSubset({ tree: { x: '12' } })
    })

    it('should throw on async plugin with callback', () => {
      function foobarPlugin (json, cb) { cb(null, json) }

      const ph = posthtml()

      ph.use(foobarPlugin)
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/Can’t process contents in sync mode because of async plugin: foobarPlugin/)
    })

    it('should throw on async plugin with Promise', () => {
      function foobarPlugin (json) {
        return new Promise(resolve => resolve(json))
      }

      const ph = posthtml()

      ph.use(foobarPlugin)
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/Can’t process contents in sync mode because of async plugin: foobarPlugin/)
    })

    it('should catch plugin runtime throws', () => {
      const ph = posthtml()

      ph.use(() => { throw new Error('FooBar') })
        .process.bind(ph, tree, { skipParse: true, sync: true })
        .should.throw(/FooBar/)
    })

    it('should have api methods after returning new root', () => {
      posthtml()
        .use(tree => ({
          tag: 'new-root',
          content: tree
        }))
        .use(tree => {
          tree.should.have.property('walk')
          tree.should.have.property('walk')
          tree.should.have.property('walk')
          tree.should.have.property('match')
          tree.walk.should.be.a('function')
        })
        .process('<div></div>', { sync: true })
    })
  })

  describe('async mode', () => {
    it('should flow async-ly', () => posthtml()
      .use(() => ({
        x: '1'
      }))
      .use(({ x }, cb) => { cb(null, { x: `${x}2` }) })
      .use(({ x }) => Promise.resolve({ x: `${x}3` }))
      .use(({ x }) => new Promise(resolve => {
        setImmediate(resolve, { x: `${x}4` })
      }))
      .use(({ x }) => ({
        x: `${x}5`
      }))
      .process(tree, { skipParse: true })
      .should.eventually.containSubset({ tree: { x: '12345' } }))

    it('should flow the same object async-ly', () => posthtml()
      .use(json => { json.x = '1' })
      .use((json, cb) => { json.x += '2'; cb() })
      .use(json => {
        json.x += '3'
        return Promise.resolve()
      })
      .use(json => new Promise(resolve => {
        setTimeout(() => {
          json.x += '4'
          resolve()
        }, 50)
      }))
      .use(json => { json.x += '5' })
      .process(tree, { skipParse: true })
      .should.eventually.containSubset({ tree: { x: '12345' } }))

    it('should catch plugin runtime throws and transform it to rejects',
      () => posthtml()
        .use(() => { throw new Error('FooBar') })
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /FooBar/)
    )

    it('should transform callback errors to rejects', () => {
      posthtml()
        .use((_, cb) => { cb(new Error('FooBar')) })
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /FooBar/)
    })

    it('should pass other rejects', () => {
      posthtml()
        .use(() => Promise.reject(new Error('FooBar')))
        .process(tree, { skipParse: true })
        .should.be.rejectedWith(Error, /FooBar/)
    })

    it('should have api methods after returning new root', () => {
      posthtml()
        .use(tree => Promise.resolve({ tag: 'new-root', content: tree }))
        .use(tree => {
          tree.should.have.property('walk')
          tree.should.have.property('match')
          tree.walk.should.be.a('function')
        })
        .process('<div></div>')
    })
  })

  describe('other options', () => {
    it('should modify options in plugin runtime', () => {
      const html = '<div class="cls"><br><rect></div>'
      const ref = '<div class="cls"><br /><rect /></div>'

      return posthtml()
        .use(({ options }) => {
          options.singleTags = ['rect']
          options.closingSingleTag = 'slash'
        })
        .process(html)
        .should.eventually.containSubset({
          html: ref,
          tree: [{
            tag: 'div',
            attrs: { class: 'cls' },
            content: [{ tag: 'br' }, { tag: 'rect' }]
          }]
        })
    })
  })
})
