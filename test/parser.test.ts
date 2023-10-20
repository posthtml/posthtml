import { readFileSync } from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

import { parser } from "posthtml-parser";
import { render } from "posthtml-render";

const html = readFileSync(path.resolve(__dirname, "templates/parser.html"), "utf8");

describe("Parser", () => {
  it("parser => render", () =>
    new Promise((done) => {
      expect(html).to.eql(render(parser(html)));
      done();
    }));
});
