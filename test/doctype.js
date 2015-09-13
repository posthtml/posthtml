/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';

const doctype = fs.readFileSync(path.resolve(__dirname, 'templates/doctype.html'), 'utf8').toString();

function test(html, reference, done) {
    posthtml().process(html).then(result => {
        expect(reference).to.eql(result.html);
        done();
    }).catch(error => done(error));
}

describe('Parse Doctype', () => {

    it('doctype eqval', done => {
        test(doctype, doctype, done);
    });

});
