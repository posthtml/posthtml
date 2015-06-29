import posthtml from '../index.js';
import { expect } from 'chai';

var beforeHTML = '<div class="button"><rect/><div class="button__text">Text</div></div>',
    options = { tmplOptions : { shortTags : ['rect'] } };


function test(html, done) {
    posthtml(options).process(html).then(result => {
        expect(beforeHTML).to.eql(result);
        done();
    }).catch(error => done(error));
}

describe('Set options', () => {

    it('html eqval', done => {
        test(beforeHTML, done);
    });

    it('minifer \\n', done => {
        test('<div class="button">\n<rect/>\n<div class="button__text">Text</div>\n</div>', done);
    });

    it('Get options', done => {
        expect(posthtml().getOptions()).to.eql({});
        expect(posthtml({ op: 1 }).getOptions().op).to.eql(1);
        done();
    })

});

