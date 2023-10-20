import { readFileSync } from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

const { parser } = require('posthtml-parser');
const { render } = require('posthtml-render');

const html = readFileSync(
  path.resolve(__dirname, 'templates/parser.html'),
  'utf8'
);

describe('Parser', () => {
  it('parser => render', () => new Promise((done) => {
    expect(html).to.eql(render(parser(html)));
    done();
  }));
});
