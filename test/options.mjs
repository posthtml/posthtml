import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../lib/index.mjs'

const input = '<div class="button"><rect /><div class="button__text">Text</div></div>'

function test (html, done) {
  const options = { singleTags: ['rect'], closingSingleTag: 'slash' }
  posthtml()
    .process(html, options)
    .then(result => {
      expect(input).to.eql(result.html)
      done()
    })
    .catch(error => done(error))
}

describe('Set options', () => {
  it('html equal', done => {
    test(input, done)
  })
})

describe('Skip html parsing', () => {
  const options = { skipParse: true }

  it('use number tree.', done => {
    const tree = 123456789
    expect(posthtml()
      .process(tree, options)
      .then(({ html }) => {
        expect('123456789').to.eql(html)
        done()
      })
      .catch(error => done(error))
    )
  })

  it('use string tree.', done => {
    const tree = '123456789'
    expect(posthtml()
      .process(tree, options)
      .then(({ html }) => {
        expect('123456789').to.eql(html)
        done()
      })
      .catch(error => done(error))
    )
  })

  it('use string tree with plugin.', done => {
    const tree = '123456789'
    const plugin = function (tree) {
      tree.walk(node => node)
      return tree
    }
    expect(posthtml([plugin])
      .process(tree, options)
      .then(({ html }) => {
        expect('123456789').to.eql(html)
        done()
      })
      .catch(error => done(error))
    )
  })
})

describe('Use tree from options.', () => {
  const options = { singleTags: ['rect'], closingSingleTag: 'slash' }
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

  it('Set use tree', done => {
    options.skipParse = true
    expect(posthtml()
      .process(tree, options)
      .then(({ html }) => {
        expect(input).to.eql(html)
        done()
      })
      .catch(error => done(error))
    )
  })
})

describe('Set option', () => {
  const options = { singleTags: ['rect'], closingSingleTag: 'slash' }
  const html = '<?php echo "Hello word"; ?>'
  const multiHTML = `<!doctype><html><body>${html}</body></html>`

  options.directives = [
    { name: '?php', start: '<', end: '>' }
  ]

  it('directive ?php', done => {
    expect(posthtml()
      .process(html, options)
      .then(result => {
        expect(html).to.eql(result.html)
        done()
      })
      .catch(error => done(error))
    )
  })

  it('directive ?php with multi html', done => {
    expect(posthtml()
      .process(multiHTML, options)
      .then(result => {
        expect(multiHTML).to.eql(result.html)
        done()
      })
      .catch(error => done(error))
    )
  })
})
