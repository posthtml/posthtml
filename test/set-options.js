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
    });

});

describe('Skip html parsing & use tree from options.', () => {

    let tree = [{"block":"button","content":[{"tag":"rect"},{"block":"button","elem":"text","content":["Text"]}]}];

    it('Set use tree', done => {
        expect(posthtml({ skipParse : true })
            .process(tree)
            .then(result => {
                expect(beforeHTML).to.eql(result);
                done();
            }).catch(error => done(error)));
    })
});
