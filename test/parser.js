/* jshint mocha: true, maxlen: false */
import { expect } from 'chai';
import parser from 'posthtml-parser';
import render from 'posthtml-render';
import path from 'path';
import fs from 'fs';

const html = fs.readFileSync(path.resolve(__dirname, 'templates/parser.html'), 'utf8').toString();

describe('Parser', () => {
    it('parser => render', done => {
        expect(html).to.eql(render(parser(html)));
        done();
    });
});
