/* jshint mocha: true, maxlen: false */
import { describe, it, beforeEach } from 'mocha';
import posthtml from '../index.js';

describe('Plugins', () => {

    const html = '<div class="button"><div class="button__text">Text</div></div>';
    let tree;
    beforeEach(() => {
        tree = [{
            tag: 'div',
            attrs: {
                class: 'button'
            },
            content: [
                {
                    tag: 'div',
                    attrs: {
                        class: 'button__text'
                    },
                    content: [
                        'Text'
                    ]
                }
            ]
        }];
    });

    describe('posthtml([plugins])', () => {

        it('options default', () =>
            posthtml([ json => json ])
                .process(html, {})
                .should.eventually.containSubset({ html }));

        it('should return original for resultless plugins', () =>
            posthtml([ json => {} ]) // jshint ignore: line
                .process(tree, { skipParse: true })
                .should.eventually.containSubset({ tree }));

        it('set options skipParse', () =>
            posthtml([ json => json ])
                .process(tree, { skipParse: true })
                .should.eventually.containSubset({ tree, html }));

    });

    describe('.use(plugin)', () => {

        it('options default', () =>
            posthtml()
                .use(json => json)
                .use(json => {}) // jshint ignore: line
                .process(html, {})
                .should.eventually.containSubset({ html }));

        it('set options skipParse', () =>
            posthtml()
                .use(json => json)
                .process(tree, { skipParse: true })
                .should.eventually.containSubset({ html }));

    });

    describe('sync mode', () => {

        it('should run plugins sync-ly', () => {
            posthtml([ json => json ])
                .process(tree, { skipParse: true, sync: true })
                .should.containSubset({ html, tree });
        });

        it('should run plugins sync-ly, call processSync helper', () => {
            posthtml([ json => json ])
                .processSync(tree, { skipParse: true })
                .should.containSubset({ html, tree });
        });

        it('should flow sync-ly', () =>
            posthtml()
                .use(() => ({ x: '1' }))
                .use(json => ({ x: `${json.x}2` }))
                .process(tree, { skipParse: true, sync: true })
                .should.containSubset({ tree: { x: '12' } }));

        it('should flow the same object sync-ly', () =>
            posthtml()
                .use(json => { json.x = '1'; })
                .use(json => { json.x += '2'; })
                .process(tree, { skipParse: true, sync: true })
                .should.containSubset({ tree: { x: '12' }}));

        it('should throw on async plugin with callback', () => {
            function foobarPlugin(json, cb) { cb(null, json); }
            let ph = posthtml();
            ph.use(foobarPlugin)
                .process.bind(ph, tree, { skipParse: true, sync: true })
                .should.throw(/Can’t process synch.*plugin: foobarPlugin/);
        });

        it('should throw on async plugin with Promise', () => {
            function foobarPlugin(json) { return new Promise(res => res(json)); }
            let ph = posthtml();
            ph.use(foobarPlugin)
                .process.bind(ph, tree, { skipParse: true, sync: true })
                .should.throw(/Can’t process synch.*plugin: foobarPlugin/);
        });

        it('should catch plugin runtime throws', () => {
            let ph = posthtml();
            ph.use(() => { throw new Error('FooBar'); })
                .process.bind(ph, tree, { skipParse: true, sync: true })
                .should.throw(/FooBar/);
        });

        it('should have api methods after returning new root', () =>
            posthtml()
                .use(tree => ({ tag: 'new-root', content: tree }))
                .use(tree => {
                    tree.should.have.property('walk');
                    tree.should.have.property('match');
                    tree.walk.should.be.a('function');
                })
                .process('<div></div>', { sync: true }));

    });

    describe('async mode', () => {

        it('should flow async-ly', () =>
            posthtml()
                .use(() => ({ x: '1' }))
                .use((json, cb) => { cb(null, { x: `${json.x}2` }); })
                .use(json => Promise.resolve({ x: `${json.x}3` }))
                .use(json => ({ x: `${json.x}4` }))
                .process(tree, { skipParse: true })
                .should.eventually.containSubset({ tree: { x: '1234' } }));

        it('should flow the same object async-ly', () =>
            posthtml()
                .use(json => { json.x = '1'; })
                .use((json, cb) => { json.x += '2'; cb(); })
                .use(json => { json.x += 3; return Promise.resolve(); })
                .use(json => { json.x += '4'; })
                .process(tree, { skipParse: true })
                .should.eventually.containSubset({ tree: { x: '1234' }}));

        it('should catch plugin runtime throws and transform it to rejects', () =>
            posthtml()
                .use(() => { throw new Error('FooBar'); })
                .process(tree, { skipParse: true })
                .should.be.rejectedWith(Error, /FooBar/));

        it('should transform callback errors to rejects', () =>
            posthtml()
                .use((_, cb) => { cb(new Error('FooBar')); })
                .process(tree, { skipParse: true })
                .should.be.rejectedWith(Error, /FooBar/));

        it('should pass other rejects', () =>
            posthtml()
                .use(() => Promise.reject(new Error('FooBar')))
                .process(tree, { skipParse: true })
                .should.be.rejectedWith(Error, /FooBar/));

        it('should have api methods after returning new root', () =>
            posthtml()
                .use(tree => Promise.resolve({ tag: 'new-root', content: tree }))
                .use(tree => {
                    tree.should.have.property('walk');
                    tree.should.have.property('match');
                    tree.walk.should.be.a('function');
                })
                .process('<div></div>'));

    });

    describe('other options', () => {

        it('should modify options in plugin runtime', () => {
            let html = '<div class="cls"><br><rect></div>';
            let ref = '<div class="cls"><br /><rect /></div>';

            return posthtml()
                .use(tree => {
                    tree.options.singleTags = ['rect'];
                    tree.options.closingSingleTag = 'slash';
                    return tree;
                })
                .process(html)
                .should.eventually.containSubset({ html: ref, tree: [{}] });
        });

    });

});
