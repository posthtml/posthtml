/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';

const beforeHTML = '<div class="button"><rect /><div class="button__text">Text</div></div>';
const options = { singleTags: ['rect'], closingSingleTag: 'slash' };

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

});

describe('Skip html parsing & use tree from options.', () => {

    let tree = [{
            tag: 'div',
            attrs: { class: 'button' },
            content:[
                { tag: 'rect' },
                {
                    attrs: { class: 'button__text' },
                    content: ['Text']
                }
            ]
        }];

    it('Set use tree', done => {
        options.skipParse = true;
        expect(posthtml()
            .process(tree, options)
            .then(result => {
                expect(beforeHTML).to.eql(result.html);
                done();
            }).catch(error => done(error)));
    });
});
