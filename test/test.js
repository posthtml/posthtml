import posthtml from '../index.js';
import { expect } from 'chai';

var beforeHTML = '<div class="button"><div class="button__text">Text</div></div>';

function test(html, done) {
    posthtml().process(html).then(result => {
        expect(beforeHTML).to.eql(result);
        done();
    }).catch(error => done(error));
}

describe('Simple text', () => {

    it('html eqval', done => {
        test(beforeHTML, done);
    });

    it('minifer \\n', done => {
        test('<div class="button">\n<div class="button__text">Text</div>\n</div>', done);
    });

});
