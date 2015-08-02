/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';
import { minifer, file } from '../util/test.js';

const comments = minifer(file('templates/comments.html'));

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
