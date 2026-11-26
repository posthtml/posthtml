const { it, describe } = require('mocha')
const { expect } = require('chai')

const posthtml = require('../lib')

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

describe('Custom parser and render', () => {
  const parser = input => [{ tag: 'custom', content: [input] }]
  const render = tree => 'custom:' + tree[0].content[0]

  it('apply to the call and are exposed to plugins', () => {
    let treeParser
    let treeRender
    const result = posthtml([tree => {
      treeParser = tree.parser
      treeRender = tree.render
    }]).process('payload', { sync: true, parser, render })

    expect(result.html).to.eql('custom:payload')
    expect(treeParser).to.equal(parser)
    expect(treeRender).to.equal(render)
  })

  it('do not leak into other instances', () => {
    posthtml().process('payload', { sync: true, parser, render })

    expect(posthtml().process('<b>x</b>', { sync: true }).html).to.eql('<b>x</b>')
  })

  it('do not persist between calls of the same instance', () => {
    const ph = posthtml()

    ph.process('payload', { sync: true, parser, render })

    expect(ph.process('<b>x</b>', { sync: true }).html).to.eql('<b>x</b>')
  })

  it('keep options, parser and render of each concurrent async call', async () => {
    const seen = {}
    const ph = posthtml([
      () => new Promise(resolve => setTimeout(resolve, 5)),
      tree => {
        seen[tree.options.id] = tree.parser
      }
    ])

    const custom = ph.process('payload', { id: 'custom', parser, render })
    const plain = ph.process('<b>x</b>', { id: 'plain' })

    expect((await custom).html).to.eql('custom:payload')
    expect((await plain).html).to.eql('<b>x</b>')
    expect(seen.custom).to.equal(parser)
    expect(seen.plain).to.not.equal(parser)
  })

  it('leave the instance parser and render unchanged', () => {
    const ph = posthtml()
    const { parser: defaultParser, render: defaultRender } = ph

    ph.process('payload', { sync: true, parser, render })

    expect(ph.parser).to.equal(defaultParser)
    expect(ph.render).to.equal(defaultRender)
  })

  it('expose only the tree API to plugins, not arbitrary instance properties', () => {
    let keys
    const ph = posthtml([tree => {
      keys = Object.keys(tree).filter(key => Number.isNaN(Number(key)))
    }])
    ph.custom = 'not for plugins'

    ph.process('<p>x</p>', { sync: true })

    expect(keys).to.have.members([
      'version', 'name', 'plugins', 'messages', 'walk', 'match',
      'options', 'source', 'parser', 'render'
    ])
  })

  it('keep the last options on the instance for compatibility', () => {
    const ph = posthtml()
    const options = { sync: true, parser, render }

    ph.process('payload', options)

    expect(ph.options).to.equal(options)
    expect(ph.source).to.eql('payload')
  })
})
