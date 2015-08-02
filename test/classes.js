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

    it('block', done => {
        let html = '<div class="block1">text</div>';
        test(html, html, done);
    });

    it('block_modname', done => {
        let html = '<div class="block1 block1_modname">text</div>';
        test(html, html, done);
    });

    it('block_modname_modval', done => {
        let html = '<div class="block1 block1_modname_modval">text</div>';
        test(html, html, done);
    });

    it('mix blocks', done => {
        let html = '<div class="block1 block2">text</div>';
        test(html, html, done);
    });

    it('mix block1 block2_modname', done => {
        let html = '<div class="block1 block2 block2_modname">text</div>';
        test(html, html, done);
    });

    it('mix block1_modname block2_modname', done => {
        let html = '<div class="block1 block1_modname block2 block2_modname">text</div>';
        test(html, html, done);
    });

    it('mix block1 block2_modname_modval', done => {
        let html = '<div class="block1 block2 block2_modname_modval">text</div>';
        test(html, html, done);
    });

    it('mix block1_modval_modname block2_modname_modval', done => {
        let html = '<div class="block1 block1_modname_modval block2 block2_modname_modval">text</div>';
        test(html, html, done);
    });

    it('block__elem', done => {
        let html = '<div class="block1"><div class="block1__elem">text</div></div>';
        test(html, html, done);
    });

    it('block__elem_modname', done => {
        let html = '<div class="block1"><div class="block1__elem block1__elem_modname">text</div></div>';
        test(html, html, done);
    });

    it('block__elem_modname_modval', done => {
        let html = '<div class="block1"><div class="block1__elem block1__elem_modname_modval">text</div></div>';
        test(html, html, done);
    });

    it('mix elems', done => {
        let html = '<div class="block1 block2"><div class="block1__elem block2__elem">text</div></div>';
        test(html, html, done);
    });

    it('mix block1__elem block2__elem_modname', done => {
        let html = '<div class="block1 block2"><div class="block1__elem block2__elem block2__elem_modname">text</div></div>';
        test(html, html, done);
    });

    it('mix block1__elem_modname block2__elem_modname', done => {
        let html = '<div class="block1 block2"><div class="block1__elem block1__elem_modval block2__elem block2__elem_modname">text</div></div>';
        test(html, html, done);
    });

    it('mix block1__elem block2__elem_modname_modval', done => {
        let html = '<div class="block1 block2"><div class="block1__elem block2__elem block2__elem_modname_modval">text</div></div>';
        test(html, html, done);
    });

    it('mix block1__elem_modname_modval block2__elem_modname_modval', done => {
        let html = '<div class="block1 block2"><div class="block1__elem block1__elem_modname_modval block2__elem block2__elem_modname_modval">text</div></div>';
        test(html, html, done);
    });

    it('block1__elem__elem', done => {
        let html = '<div class="block1__elem__elem">text</div>';
        test(html, html, done);
    });
});
