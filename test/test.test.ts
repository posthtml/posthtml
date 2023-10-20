import { describe, expect, it } from "vitest";

import posthtml from "../lib";

const input = '<div class="button"><div class="button__text">Text</div></div>';

function test(html, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(input).to.eql(result.html);
      done();
    })
    .catch((error) => done(error));
}

describe("Simple text", () => {
  it("html eqval", () =>
    new Promise((done) => {
      test(input, done);
    }));
});
