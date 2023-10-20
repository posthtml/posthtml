import { describe, expect, it } from "vitest";

import posthtml from "../src";

const text = "text";

function test(html, reference, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(reference).to.eql(result.html);
      done();
    })
    .catch((error) => done(error));
}

describe("Parse text", () => {
  it("Text equal", () =>
    new Promise((done) => {
      test(text, text, done);
    }));
});