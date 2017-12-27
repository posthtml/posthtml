'use strict'

const it = require('mocha').it
const expect = require('chai').expect
const describe = require('mocha').describe

const posthtml = require('../lib')

const walk = require('../lib/api').walk
const match = require('../lib/api').match

function test (nodes, reference, fn, options, done) {
  expect(posthtml([].concat(fn))
    .process(nodes, options)
    .then((result) => {
      expect(reference).to.eql(result.html)

      done()
    })
    .catch(done))
}

describe('API', function () {
  it('chaining', function (done) {
    test('<a></a><a></a><a></a>', '<c></c><c></c><c></c>', plugin, {}, done)

    function plugin (tree) {
      tree
        .walk((node) => node)
        .walk((node) => node)
        .match({ tag: 'a' }, () => ({ tag: 'b' }))
        .match({ tag: 'b' }, () => ({ tag: 'c' }))
    }
  })

  it('walk', function (done) {
    const html = '<div class="cls"><header class="test"><div class="cls test">Text</div></header></div>'
    const reference = '<div class="cls"><header class="test" id="index2"><div class="cls test" id="index3">Text</div></header></div>'

    test(html, reference, plugin, {}, done)

    function plugin (tree) {
      let num = 0

      tree.walk((node) => {
        num++

        const classes = node.attrs && node.attrs.class.split(' ')

        if (classes && classes.indexOf('test') > -1) {
          node.attrs = Object.assign({}, node.attrs, {
            id: 'index' + num
          })
        }

        return node
      })
    }
  })

  describe('match', function () {
    it('Wrap node', function (done) {
      var html = '<div><header><div>Text</div></header></div>'
      var reference = '<div><span><header><div>Text</div></header></span></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match({ tag: 'header' }, (node) => {
          return { tag: 'span', content: node }
        })
      }
    })

    it('{Object}', function (done) {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div id="index1"><header><div id="index2">Text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        var num = 0

        tree.match({ tag: 'div' }, (node) => {
          num++

          node.attrs = Object.assign({}, node.attrs, {
            id: 'index' + num
          })

          return node
        })

        return tree
      }
    })

    it('{String}', function (done) {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div><header><div>Other Text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match('Text', () => 'Other Text')
      }
    })

    it('{Array}', function (done) {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<span><span><span>Text</span></span></span>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match([{ tag: 'div' }, { tag: 'header' }], (node) => {
          node.tag = 'span'

          return node
        })
      }
    })

    it('Array with multiple matches', function (done) {
      const html = '<div class="a b">0</div>'
      const reference = '<div class="a b">1</div>'

      const classes = [ /a/, /b/ ].map((name) => {
        return { attrs: { class: name } }
      })

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match(classes, (node) => {
          node.content++

          return node
        })
      }
    })

    it('Content', function (done) {
      const html = '<div><header><div>Text</div></header></div>'
      const reference = '<div><header><div>Other Text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match({ content: ['Text'] }, (node) => {
          node.content = ['Other Text']

          return node
        })
      }
    })

    describe('{RegExp}', function () {
      it('{String}', function (done) {
        const html = '<div><!-- replace this --><header><div>Text</div></header></div>'
        const reference = '<div>RegExp cool!<header><div>Text</div></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match(/<!--.*-->/g, () => {
            return 'RegExp cool!'
          })
        }
      })

      it('Object', function (done) {
        const html = '<div><header style="color: red  border: 3px solid #000"><div>Text</div></header></div>'
        const reference = '<div><header style="border: 3px solid #000"><div>Text</div></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ attrs: { style: /border.+solid/gi } }, (node) => {
            const attrs = node.attrs

            attrs.style = attrs.style.replace('color: red  ', '')

            return node
          })
        }
      })
    })

    describe('{Boolean}', function () {
      it('true', function (done) {
        const html = '<div><header><div>Text</div></header></div>'
        const reference = '<div><header>Other text</header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ content: true }, (node) => {
            if (node.tag === 'header') {
              node.content = ['Other text']
            }

            return node
          })
        }
      })

      it('true with attrs', function (done) {
        const html = '<ol reversed></ol>'
        const reference = '<ol></ol>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ attrs: { reversed: true } }, (node) => {
            delete node.attrs.reversed

            return node
          })
        }
      })

      it('true with 0 value', function (done) {
        const html = '<input type="number" value="1">'
        const reference = '<input type="number" value="0" class="matched">'

        const plugins = [
          function (tree) {
            tree.match({ tag: 'input' }, (node) => {
              node.attrs.value--

              return node
            })
          },
          function (tree) {
            tree.match({ attrs: { value: true } }, (node) => {
              node.attrs.class = 'matched'

              return node
            })
          }
        ]

        test(html, reference, plugins, {}, done)
      })

      it('false', function (done) {
        const html = '<div><img><header><div></div></header></div>'
        const reference = '<div><header></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ content: false }, () => '')
        }
      })
    })
  })

  describe('API', function () {
    it('walk', function () {
      const tree = [
        'test',
        {
          tag: 'a',
          content: ['find']
        },
        { tag: 'a' }
      ]

      walk.call(tree, () => 'a')

      expect(['a', 'a', 'a']).to.eql(tree)
    })

    it('match', function () {
      const tree = [
        {
          tag: 'a',
          content: ['find']
        },
        { tag: 'a' }
      ]

      match.call(tree, { tag: 'a', content: true }, () => 'a')

      expect(['a', { tag: 'a' }]).to.eql(tree)
    })
  })
})
