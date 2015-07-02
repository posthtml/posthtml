import posthtml from '../index.js';
import { expect } from 'chai';

const html = '<div class="button"><rect/><div class="button__text">Text</div></div>';
/*eslint-disable */
const tree = [{"block":"button","content":[{"tag":"rect"},{"block":"button","elem":"text","content":["Text"]}]}];
/*eslint-enable */

function testPluginsArray(nodes, options, done) {
    expect(posthtml([ function(json) { return json; }, function(json) { return json; }])
        .process(nodes, options)
        .then(result => {
            expect(html).to.eql(result.html);
            done();
        }).catch(error => done(error)));
}

function testPluginUse(nodes, options, done) {
    expect(posthtml()
        .use(function(json) { return json; })
        .use(function(json) { return json; })
        .process(nodes, options)
        .then(result => {
            expect(html).to.eql(result.html);
            done();
        }).catch(error => done(error)));
}

describe('Plugins', () => {

    describe('posthtml([plugins])', () => {

        it('options default', done => {
            testPluginsArray(html, {}, done);
        });

        it('set options skipParse', done => {
            testPluginsArray(html, { skipParse : true }, done);
        });

    });

    describe('use(plugin)', () => {

        it('options default', done => {
            testPluginUse(html, {}, done);
        });

        it('set options skipParse', done => {
            testPluginUse(html, { skipParse : true }, done);
        });

    });

});
