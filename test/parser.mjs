import { readFileSync } from 'fs'

import { it, describe } from 'mocha'
import { expect } from 'chai'

import { parser } from 'posthtml-parser'
import { render } from 'posthtml-render'

const html = readFileSync(
  new URL('./templates/parser.html', import.meta.url), 'utf8'
)

describe('Parser', () => {
  it('parser => render', done => {
    expect(html).to.eql(render(parser(html)))
    done()
  })
})
