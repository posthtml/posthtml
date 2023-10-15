import { readFileSync } from 'fs'
import { resolve } from 'path'

import { it, describe } from 'mocha'
import { expect } from 'chai'

import { parser } from 'posthtml-parser'
import { render } from 'posthtml-render'

const html = readFileSync(
  resolve(__dirname, 'templates/parser.html'), 'utf8'
)

describe('Parser', () => {
  it('parser => render', done => {
    expect(html).to.eql(render(parser(html)))
    done()
  })
})
