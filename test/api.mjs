import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../dist/index.mjs'
import { walk, match } from '../dist/api.mjs'

function test (nodes, reference, fn, options, done) {
  expect(posthtml([].concat(fn))
    .process(nodes, options)
    .then(({ html }) => {
      expect(reference).to.eql(html)
      done()
    })
    .catch(done))
}

describe('API', () => {
  it('chaining', done => {
    test('<a></a><a></a><a></a>', '<c></c><c></c><c></c>', plugin, {}, done)

    function plugin (tree) {
      tree
        .walk(node => node)
        .walk(node => node)
        .match({ tag: 'a' }, () => ({
          tag: 'b'
        }))
        .match({ tag: 'b' }, () => ({
          tag: 'c'
        }))
    }
  })

  it('walk', done => {
    const html = '<div class="cls"><header class="test"><div class="cls test">Text</div></header></div>'
    const reference = '<div class="cls"><header class="test" id="index2"><div class="cls test" id="index3">Text</div></header></div>'

    test(html, reference, plugin, {}, done)

    function plugin (tree) {
      let num = 0

      tree.walk(node => {
        num++

        const classes = node.attrs && node.attrs.class.split(' ')

        if (classes && classes.includes('test')) {
          node.attrs = Object.assign({}, node.attrs, {
            id: `index${num}`
          })
        }

        return node
      })
    }
  })

  describe('match', () => {
    it('Wrap node', done => {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div><span><header><div>Text</div></header></span></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match({ tag: 'header' }, node => ({
          tag: 'span',
          content: node
        }))
      }
    })

    it('Object', done => {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div id="index1"><header><div id="index2">Text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        let num = 0

        tree.match({ tag: 'div' }, node => {
          num++

          node.attrs = Object.assign({}, node.attrs, {
            id: `index${num}`
          })

          return node
        })

        return tree
      }
    })

    it('String', done => {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div><header><div>Other text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match('Text', () => 'Other text')
      }
    })

    it('Array', done => {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<span><span><span>Text</span></span></span>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match([{ tag: 'div' }, { tag: 'header' }], node => {
          node.tag = 'span'
          return node
        })
      }
    })

    it('Array with multiple matches', done => {
      const html = '<div class="a b">0</div>'
      const reference = '<div class="a b">1</div>'
      const classes = [/a/, /b/].map(name => ({
        attrs: { class: name }
      }))

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match(classes, node => {
          node.content++
          return node
        })
      }
    })

    it('Content', done => {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div><header><div>Other text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match({ content: ['Text'] }, node => {
          node.content = ['Other text']
          return node
        })
      }
    })

    describe('RegExp', () => {
      it('String', done => {
        const html = '<div><!-- replace this --><header><div>Text</div></header></div>'
        const reference = '<div>RegExp cool!<header><div>Text</div></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match(/<!--.*-->/g, () => 'RegExp cool!')
        }
      })

      it('Object', done => {
        const html = '<div><header style="color: red  border: 3px solid #000"><div>Text</div></header></div>'
        const reference = '<div><header style="border: 3px solid #000"><div>Text</div></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ attrs: { style: /border.+solid/gi } }, node => {
            const attrs = node.attrs

            attrs.style = attrs.style.replace('color: red  ', '')

            return node
          })
        }
      })
    })

    describe('Boolean', () => {
      it('true', done => {
        const html = '<div><header><div>Text</div></header></div>'
        const reference = '<div><header>Other text</header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ content: true }, node => {
            if (node.tag === 'header') {
              node.content = ['Other text']
            }

            return node
          })
        }
      })

      it('true with boolean attrs', done => {
        const html = '<ol reversed></ol>'
        const reference = '<ol></ol>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ attrs: { reversed: true } }, node => {
            delete node.attrs.reversed

            return node
          })
        }
      })

      it('true with 0 value', done => {
        const html = '<input type="number" value="1">'
        const reference = '<input type="number" value="0" class="matched">'
        const plugins = [
          tree => {
            tree.match({ tag: 'input' }, node => {
              node.attrs.value--

              return node
            })
          },
          tree => {
            tree.match({ attrs: { value: true } }, node => {
              node.attrs.class = 'matched'

              return node
            })
          }
        ]

        test(html, reference, plugins, {}, done)
      })

      it('false', done => {
        const html = '<div><img><section><div></div></section></div>'
        const reference = '<div><section></section></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ content: false }, () => '')
        }
      })
    })
  })

  describe('import API', () => {
    it('walk', () => {
      const tree = ['test', { tag: 'a', content: ['find'] }, { tag: 'a' }]

      walk.call(tree, () => 'a')
      expect(['a', 'a', 'a']).to.eql(tree)
    })

    it('match', () => {
      const tree = [{ tag: 'a', content: ['find'] }, { tag: 'a' }]

      match.call(tree, { tag: 'a', content: true }, () => 'a')
      expect(['a', { tag: 'a' }]).to.eql(tree)
    })
  })
})
