/* jshint mocha: true, maxlen: false */
var expect = require('chai').expect;
var objectAssign = require('object-assign');

var posthtml = require('../lib/posthtml');
var walk = require('../lib/api').walk;
var match = require('../lib/api').match;

function test(nodes, referense, fn, options, done) {
    expect(posthtml([].concat(fn))
        .process(nodes, options)
        .then(function(result) {
            expect(referense).to.eql(result.html);
            done();
        }).catch(function(error) { return done(error); }));
}

describe('API', function() {

    it('chaining', function(done) {
        test('<a></a><a></a><a></a>', '<c></c><c></c><c></c>', plugin, {}, done);

        function plugin(tree) {
            tree
                .walk(function(node) { return node; })
                .walk(function(node) { return node; })
                .match({ tag: 'a' }, function() { return { tag: 'b' }; })
                .match({ tag: 'b' }, function() { return { tag: 'c' }; });
        }
    });

    it('walk', function(done) {
        var html = '<div class="cls"><header class="test"><div class="cls test">Text</div></header></div>';
        var referense = '<div class="cls"><header class="test" id="index2"><div class="cls test" id="index3">Text</div></header></div>';

        test(html, referense, plugin, {}, done);

        function plugin(tree) {
            var num = 0;
            tree.walk(function(node) {
                num++;
                var classes = node.attrs && node.attrs.class.split(' ') || [];
                if (classes.indexOf('test') > -1) {
                    var attrs = node.attrs;
                    node.attrs = objectAssign({}, attrs, {
                        id: 'index' + num
                    });
                }
                return node;
            });
        }
    });

    describe('match', function() {
        it('Wrap node', function(done) {
            var html = '<div><header><div>Text</div></header></div>';
            var referense = '<div><span><header><div>Text</div></header></span></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match({ tag: 'header' }, function(node) {
                    return { tag: 'span', content: node };
                });
            }
        });

        it('Object', function(done) {
            var html = '<div><header><div>Text</div></header></div>';
            var referense = '<div id="index1"><header><div id="index2">Text</div></header></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                var num = 0;
                tree.match({ tag: 'div' }, function(node) {
                    num++;
                    var attrs = node.attrs;
                    node.attrs = objectAssign({}, attrs, {
                        id: 'index' + num
                    });
                    return node;
                });
                return tree;
            }
        });

        it('String', function(done) {
            var html = '<div><header><div>Text</div></header></div>';
            var referense = '<div><header><div>Other text</div></header></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match('Text', function() { return 'Other text'; });
            }
        });

        it('Array', function(done) {
            var html = '<div><header><div>Text</div></header></div>';
            var referense = '<span><span><span>Text</span></span></span>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match([{ tag: 'div'}, { tag: 'header'}], function(node) {
                    node.tag = 'span';
                    return node;
                });
            }
        });

        it('Content', function(done) {
            var html = '<div><header><div>Text</div></header></div>';
            var referense = '<div><header><div>Other text</div></header></div>';

            test(html, referense, plugin, {}, done);

            function plugin(tree) {
                tree.match({ content: ['Text']}, function(node) {
                    node.content = ['Other text'];
                    return node;
                });
            }
        });

        describe('RegExp', function() {
            it('String', function(done) {
                var html = '<div><!-- replace this --><header><div>Text</div></header></div>';
                var referense = '<div>RegExp cool!<header><div>Text</div></header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match(/<!--.*-->/g, function() {
                        return 'RegExp cool!';
                    });
                    return tree;
                }
            });

            it('Object', function(done) {
                var html = '<div><header style="color: red; border: 3px solid #000"><div>Text</div></header></div>';
                var referense = '<div><header style="border: 3px solid #000"><div>Text</div></header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match({ attrs: { style: /border.+solid/gi }}, function(node) {
                        node.attrs.style = node.attrs.style.replace('color: red; ', '');
                        return node;
                    });
                }
            });
        });

        describe('Boolean', function() {
            it('true', function(done) {
                var html = '<div><header><div>Text</div></header></div>';
                var referense = '<div><header>Other text</header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match({ content: true }, function(node) {
                        if (node.tag === 'header') {
                            node.content = ['Other text'];
                        }
                        return node;
                    });
                }
            });

            it('false', function(done) {
                var html = '<div><img><header><div></div></header></div>';
                var referense = '<div><header></header></div>';

                test(html, referense, plugin, {}, done);

                function plugin(tree) {
                    tree.match({ content: false }, function() { return ''; });
                }
            });
        });
    });

    describe('import API', function() {
        it('walk', function() {
            var tree = ['test', { tag: 'a', content: ['find'] }, { tag: 'a' }];
            walk.bind(tree)(function() { return 'a'; });
            expect(['a', 'a', 'a']).to.eql(tree);
        });

       it('match', function() {
            var tree = [{ tag: 'a', content: ['find'] }, { tag: 'a' }];
            match.bind(tree)({ tag: 'a', content: true }, function() { return 'a'; });
            expect(['a', { tag: 'a' }]).to.eql(tree);
        });
    });

});
