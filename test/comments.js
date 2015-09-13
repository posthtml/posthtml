/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';

const comments = fs.readFileSync(path.resolve(__dirname, 'templates/comments.html'), 'utf8').toString();

function test(html, reference, done) {
    posthtml().process(html).then(result => {
        expect(reference).to.eql(result.html);
        done();
    }).catch(error => done(error));
}

describe('Parse comments', () => {
    it('comments eqval', done => {
        test(comments, comments, done);
    });
});
