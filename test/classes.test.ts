import { describe, expect, it } from "vitest";

import posthtml from "../src";

function test(html, reference, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(reference).to.eql(result.html);
      done();
    })
    .catch((error) => done(error));
}

describe("Parse classes", () => {
  it("div", () =>
    new Promise((done) => {
      const html = "<div></div>";
      test(html, html, done);
    }));

  it("block1", () =>
    new Promise((done) => {
      const html = '<div class="block1">text</div>';
      test(html, html, done);
    }));

  it("block1 block2", () =>
    new Promise((done) => {
      const html = '<div class="block1 block2">text</div>';
      test(html, html, done);
    }));
});
