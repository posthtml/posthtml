/* jshint mocha: true, maxlen: false */
import posthtml from '../index.js';
import { expect } from 'chai';

function test(nodes, referense, fn, options, done) {
    expect(posthtml([].concat(fn))
        .process(nodes, options)
        .then(result => {
            expect(referense).to.eql(result.html);
            done();
        }).catch(error => done(error)));
}

describe('API', () => {

    it('walk', done => {
        let html = '<div class="cls"><header class="test"><div class="cls test">Text</div></header></div>';
        let referense = '<div class="cls"><header class="test" id="index2"><div class="cls test" id="index3">Text</div></header></div>';

        test(html, referense, plugin, {}, done);

        function plugin(tree) {
            var num = 0;
            tree.walk(node => {
                num++;
                let classes = node.attrs && node.attrs.class.split(' ') || [];
                if (classes.includes('test')) {
                    let attrs = node.attrs;
                    node.attrs = Object.assign({}, attrs, {
                        id: `index${num}`
                    });
                }
                return node;
            });
            return tree;
        }
    });

    describe('match', () => {
        it('Wrap node', done => {
            let html = '<div><header><div>Text</div></header></div>';
            let referense = '<div><span><header><div>Text</div></header></span></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match({ tag: 'header' }, node => ({ tag: 'span', content: node }));
                return tree;
            }
        });

        it('Object', done => {
            let html = '<div><header><div>Text</div></header></div>';
            let referense = '<div id="index1"><header><div id="index2">Text</div></header></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                var num = 0;
                tree.match({ tag: 'div' }, node => {
                    num++;
                    let attrs = node.attrs;
                    node.attrs = Object.assign({}, attrs, {
                        id: `index${num}`
                    });
                    return node;
                });
                return tree;
            }
        });

        it('String', done => {
            let html = '<div><header><div>Text</div></header></div>';
            let referense = '<div><header><div>Other text</div></header></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match('Text', () => 'Other text');
                return tree;
            }
        });

        it('Array', done => {
            let html = '<div><header><div>Text</div></header></div>';
            let referense = '<span><span><span>Text</span></span></span>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match([{ tag: 'div'}, { tag: 'header'}], node => {
                    node.tag = 'span';
                    return node;
                });
                return tree;
            }
        });

        it('Content', done => {
            let html = '<div><header><div>Text</div></header></div>';
            let referense = '<div><header><div>Other text</div></header></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match({ content: ['Text']}, node => {
                    node.content = ['Other text'];
                    return node;
                });
                return tree;
            }
        });

        describe('RegExp', () => {
            it('String', done => {
                let html = '<div><!-- replace this --><header><div>Text</div></header></div>';
                let referense = '<div>RegExp cool!<header><div>Text</div></header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match(/<!--.*-->/g, () => 'RegExp cool!');
                    return tree;
                }
            });

            it('Object', done => {
                let html = '<div><header style="color: red; border: 3px solid #000"><div>Text</div></header></div>';
                let referense = '<div><header style="border: 3px solid #000"><div>Text</div></header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match({ attrs: { style: /border.+solid/gi }}, node => {
                        node.attrs.style = node.attrs.style.replace('color: red; ', '');
                        return node;
                    });
                    return tree;
                }
            });
        });

        describe('Boolean', () => {
            it('true', done => {
                let html = '<div><header><div>Text</div></header></div>';
                let referense = '<div><header>Other text</header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match({ content: true }, node => {
                        if (node.tag === 'header') {
                            node.content = ['Other text'];
                        }
                        return node;
                    });
                    return tree;
                }
            });

            it('false', done => {
                let html = '<div><img><header><div></div></header></div>';
                let referense = '<div><header></header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match({ content: false }, () => '');
                    return tree;
                }
            });
        });
    });

});
