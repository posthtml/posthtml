/* jshint mocha: true, maxlen: false */
import { expect } from 'chai';
import { toTree, toHtml } from '../lib/parser.js';
import path from 'path';
import fs from 'fs';

const applecom = fs.readFileSync(path.resolve(__dirname, 'templates/applecom.html'), 'utf8').toString();
const html = fs.readFileSync(path.resolve(__dirname, 'templates/parser.html'), 'utf8').toString();
const tree = require('./templates/parser.js');

describe('Parser', () => {

    it('toTree', done => {
        expect(tree).to.eql(toTree(html));
        done();
    });

    it('toHtml', done => {
        expect(html).to.eql(toHtml(tree));
        done();
    });

    it('toTree => toHtml', done => {
        expect(applecom).to.eql(toHtml(toTree(applecom)));
        done();
    });

});
