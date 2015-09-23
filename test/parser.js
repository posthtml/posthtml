/* jshint mocha: true, maxlen: false */
import { expect } from 'chai';
import { toTree, toHtml } from '../lib/parser.js';
import path from 'path';
import fs from 'fs';

const html = fs.readFileSync(path.resolve(__dirname, 'templates/parser.html'), 'utf8').toString();
const tree = require('./templates/parser.js');

describe('Parser', () => {

    describe('toTree', () => {
        it('html to tree', done => {
            expect(tree).to.eql(toTree(html));
            done();
        });
    });

    describe('toHtml', () => {
        it('tree to html', done => {
            expect(html).to.eql(toHtml(tree));
            done();
        });

        it('skip string', done => {
            expect('skip string').to.eql(toHtml('skip string'));
            done();
        });

        it('default single tags', done => {
            const TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
            let tree = TAGS.map(tag => ({ tag: tag }));
            let html = TAGS.map(tag => `<${tag}>`).join('');
            expect(html).to.eql(toHtml(tree));
            done();
        });

        describe('options', () => {
            describe('singleTags', () => {
                it('set tags', done => {
                    let tree = [{ tag: 'rect' }, { tag: 'custom' }];
                    let html = '<rect><custom>';

                    expect(html).to.eql(toHtml(tree, { singleTags: ['rect', 'custom']}));
                    done();
                });

                it('safe attrs', done => {
                    let tree = [{ tag: 'rect', attrs: { id: 'foo' } }];
                    let html = '<rect id="foo">';

                    expect(html).to.eql(toHtml(tree, { singleTags: ['rect' ]}));
                    done();
                });
            });

            describe('closingSingleTag', () => {
                it('default', done => {
                    let tree = [{ tag: 'img' }];
                    let html = '<img>';

                    expect(html).to.eql(toHtml(tree, { closingSingleTag: 'default'}));
                    done();
                });

                it('slash', done => {
                    let tree = [{ tag: 'img' }];
                    let html = '<img />';

                    expect(html).to.eql(toHtml(tree, { closingSingleTag: 'slash'}));
                    done();
                });

                it('tag', done => {
                    let tree = [{ tag: 'img' }];
                    let html = '<img></img>';

                    expect(html).to.eql(toHtml(tree, { closingSingleTag: 'tag'}));
                    done();
                });
            });
        });
    });

    it('toTree => toHtml', done => {
        expect(html).to.eql(toHtml(toTree(html)));
        done();
    });

});
