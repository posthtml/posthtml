/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';

const beforeHTML = '<div class="button"><div class="button__text">Text</div></div>';

function test(html, done) {
    posthtml().process(html).then(result => {
        expect(beforeHTML).to.eql(result.html);
        done();
    }).catch(error => done(error));
}

describe('Simple text', () => {

    it('html eqval', done => {
        test(beforeHTML, done);
    });

});
