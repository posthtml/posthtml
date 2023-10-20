import { describe, expect, it } from "vitest";

import posthtml from "../src";

const html = null;

function test(html, done) {
  posthtml()
    .use((tree) => {
      tree.walk((node) => node);
      tree.match(/(.+)/, (node) => node);

      tree.messages.push({
        type: "warning",
        message: "tree is empty",
      });

      return tree;
    })
    .process(html, { skipParse: true })
    .then((result) => {
      expect("").to.eql(result.html);

      done();
    })
    .catch((error) => {
      done(error);
    });
}

describe("Process", () => {
  it("should not throw on empty tree", () =>
    new Promise((done) => {
      test(html, done);
    }));
});
