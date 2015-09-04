/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';

function test(html, reference, done) {
    posthtml().process(html).then(result => {
        expect(reference).to.eql(result.html);
        done();
    }).catch(error => done(error));
}

describe('Parse classes', () => {

    it('div', done => {
        let html = '<div></div>';
        test(html, html, done);
    });

    it('block1', done => {
        let html = '<div class="block1">text</div>';
        test(html, html, done);
    });

    it('block1 block2', done => {
        let html = '<div class="block1 block2">text</div>';
        test(html, html, done);
    });
});
