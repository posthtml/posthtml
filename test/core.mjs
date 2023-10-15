import { it, describe } from 'mocha'
import { expect } from 'chai'

import posthtml from '../lib/index.mjs'

describe('core methods', () => {
  it('tree should have methods', () => {
    posthtml()
      .use(tree => {
        tree.should.have.property('render')
        tree.should.have.property('parser')
        tree.toString.should.be.a('function')
      })
      .process('<div></div>')
  })

  it('core methods parser', done => {
    const html = '<import>'
    const ref = '<div>import</div>'

    posthtml()
      .use(tree => {
        tree.match({ tag: 'import' }, node => {
          node.tag = false
          node.content = tree.parser('<div>import</div>')
          return node
        })
        return tree
      })
      .process(html)
      .then(result => {
        expect(ref).to.eql(result.html)

        done()
      })
      .catch(error => {
        done(error)
      })
  })

  it('core methods render', done => {
    const html = '\n<div>1</div>\n\t<div>2</div>\n'
    const ref = '<div>1</div><div>2</div>'

    posthtml()
      .use(tree => {
        const outherTree = ['\n', { tag: 'div', content: ['1'] }, '\n\t', { tag: 'div', content: ['2'] }, '\n']
        const htmlWitchoutSpaceless = tree.render(outherTree).replace(/[\n|\t]/g, '')
        return tree.parser(htmlWitchoutSpaceless)
      })
      .process(html)
      .then(result => {
        expect(ref).to.eql(result.html)

        done()
      })
      .catch(error => {
        done(error)
      })
  })
})
