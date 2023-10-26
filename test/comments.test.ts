import { readFileSync } from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

import posthtml from "../src";

const comments = readFileSync(path.resolve(__dirname, "templates/comments.html"), "utf8");

function test(html, reference, done) {
  posthtml()
    .process(html)
    .then((result) => {
      expect(reference).to.eql(result.html);
      done();
    })
    .catch((error) => done(error));
}

describe("Parse comments", () => {
  it("comments equal", () =>
    new Promise((done) => {
      test(comments, comments, done);
    }));
});
