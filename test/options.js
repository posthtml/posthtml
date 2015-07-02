import posthtml from '../index.js';
import { expect } from 'chai';

var beforeHTML = '<div class="button"><rect/><div class="button__text">Text</div></div>',
    options = { tmplOptions : { shortTags : ['rect'] } };


function test(html, done) {
    posthtml().process(html, options).then(result => {
        expect(beforeHTML).to.eql(result.html);
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

        expect(posthtml()
            .process('')
            .then(function(result) {
                result.getOptions().to.eql({});
            })
        );

        expect(posthtml()
            .process('', { op: 1 })
            .then(function(result) {
                result.getOptions().op.to.eql(1);
            })
        );

        done();
    });

});

describe('Skip html parsing & use tree from options.', () => {

    /*eslint-disable */
    let tree = [{"block":"button","content":[{"tag":"rect"},{"block":"button","elem":"text","content":["Text"]}]}];
    /*eslint-enable */

    it('Set use tree', done => {
        expect(posthtml()
            .process(tree, { skipParse : true })
            .then(result => {
                expect(beforeHTML).to.eql(result.html);
                done();
            }).catch(error => done(error)));
    });
});
