import { describe, expect, it } from 'vitest';

const posthtml = require('../lib');

const html = '<div class="source">source</div>';
const expected = '<div>source</div>';

function test(html, done) {
  posthtml()
    .use((tree) =>
      tree.walk((node) => {
        if (node.attrs) {
          delete node.attrs.class;
        }

        return node;
      })
    )
    .process(html)
    .then((result) => {
      expect(html).to.eql(result.tree.source);
      expect(expected).to.eql(result.html);
      done();
    })
    .catch((error) => {
      done(error);
    });
}

describe('Source', () => {
  it('Source code must not mutate', () =>
    new Promise((done) => {
      test(html, done);
    }));
});
