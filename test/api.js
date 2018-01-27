var it = require('mocha').it
var expect = require('chai').expect
var describe = require('mocha').describe

var posthtml = require('../lib')

var walk = require('../lib/api').walk
var match = require('../lib/api').match

function test (nodes, reference, fn, options, done) {
  expect(posthtml([].concat(fn))
    .process(nodes, options)
    .then(function (result) {
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
        .walk(function (node) { return node })
        .walk(function (node) { return node })
        .match({ tag: 'a' }, function () { return { tag: 'b' } })
        .match({ tag: 'b' }, function () { return { tag: 'c' } })
    }
  })

  it('walk', function (done) {
    var html = '<div class="cls"><header class="test"><div class="cls test">Text</div></header></div>'
    var reference = '<div class="cls"><header class="test" id="index2"><div class="cls test" id="index3">Text</div></header></div>'

    test(html, reference, plugin, {}, done)

    function plugin (tree) {
      var num = 0

      tree.walk(function (node) {
        num++

        var classes = node.attrs && node.attrs.class.split(' ')

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
        tree.match({ tag: 'header' }, function (node) {
          return { tag: 'span', content: node }
        })
      }
    })

    it('Object', function (done) {
      var html = '<div><header><div>Text</div></header></div>'
      var reference = '<div id="index1"><header><div id="index2">Text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        var num = 0

        tree.match({ tag: 'div' }, function (node) {
          num++

          node.attrs = Object.assign({}, node.attrs, {
            id: 'index' + num
          })

          return node
        })

        return tree
      }
    })

    it('String', function (done) {
      var html = '<div><header><div>Text</div></header></div>'
      var reference = '<div><header><div>Other text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match('Text', function () { return 'Other text' })
      }
    })

    it('Array', function (done) {
      var html = '<div><header><div>Text</div></header></div>'
      var reference = '<span><span><span>Text</span></span></span>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match([{ tag: 'div' }, { tag: 'header' }], function (node) {
          node.tag = 'span'
          return node
        })
      }
    })

    it('Array with multiple matches', function (done) {
      var html = '<div class="a b">0</div>'
      var reference = '<div class="a b">1</div>'
      var classes = [ /a/, /b/ ].map(function (name) {
        return { attrs: { class: name } }
      })

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match(classes, function (node) {
          node.content++
          return node
        })
      }
    })

    it('Content', function (done) {
      var html = '<div><header><div>Text</div></header></div>'
      var reference = '<div><header><div>Other text</div></header></div>'

      test(html, reference, plugin, {}, done)

      function plugin (tree) {
        tree.match({ content: ['Text'] }, function (node) {
          node.content = ['Other text']
          return node
        })
      }
    })

    describe('RegExp', function () {
      it('String', function (done) {
        var html = '<div><!-- replace this --><header><div>Text</div></header></div>'
        var reference = '<div>RegExp cool!<header><div>Text</div></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match(/<!--.*-->/g, function () {
            return 'RegExp cool!'
          })
        }
      })

      it('Object', function (done) {
        var html = '<div><header style="color: red  border: 3px solid #000"><div>Text</div></header></div>'
        var reference = '<div><header style="border: 3px solid #000"><div>Text</div></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ attrs: { style: /border.+solid/gi } }, function (node) {
            var attrs = node.attrs

            attrs.style = attrs.style.replace('color: red  ', '')

            return node
          })
        }
      })
    })

    describe('Boolean', function () {
      it('true', function (done) {
        var html = '<div><header><div>Text</div></header></div>'
        var reference = '<div><header>Other text</header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ content: true }, function (node) {
            if (node.tag === 'header') {
              node.content = ['Other text']
            }

            return node
          })
        }
      })

      it('true with boolean attrs', function (done) {
        var html = '<ol reversed></ol>'
        var reference = '<ol></ol>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ attrs: { reversed: true } }, function (node) {
            delete node.attrs.reversed

            return node
          })
        }
      })

      it('true with 0 value', function (done) {
        var html = '<input type="number" value="1">'
        var reference = '<input type="number" value="0" class="matched">'
        var plugins = [
          function (tree) {
            tree.match({ tag: 'input' }, function (node) {
              node.attrs.value--

              return node
            })
          },
          function (tree) {
            tree.match({ attrs: { value: true } }, function (node) {
              node.attrs.class = 'matched'

              return node
            })
          }
        ]

        test(html, reference, plugins, {}, done)
      })

      it('false', function (done) {
        var html = '<div><img><header><div></div></header></div>'
        var reference = '<div><header></header></div>'

        test(html, reference, plugin, {}, done)

        function plugin (tree) {
          tree.match({ content: false }, function () { return '' })
        }
      })
    })
  })

  describe('import API', function () {
    it('walk', function () {
      var tree = ['test', { tag: 'a', content: ['find'] }, { tag: 'a' }]

      walk.call(tree, function () { return 'a' })
      expect(['a', 'a', 'a']).to.eql(tree)
    })

    it('match', function () {
      var tree = [{ tag: 'a', content: ['find'] }, { tag: 'a' }]

      match.call(tree, { tag: 'a', content: true }, function () { return 'a' })
      expect(['a', { tag: 'a' }]).to.eql(tree)
    })
  })
})
