/* jshint mocha: true, maxlen: false */
var posthtml = require('../lib/posthtml');
var expect = require('chai').expect;

var beforeHTML = '<div class="button"><rect /><div class="button__text">Text</div></div>';
var options = { singleTags: ['rect'], closingSingleTag: 'slash' };

function test(html, done) {
    posthtml().process(html, options).then(function(result) {
        expect(beforeHTML).to.eql(result.html);
        done();
    }).catch(function(error) { return done(error); });
}

describe('Set options', function() {

    it('html eqval', function(done) {
        test(beforeHTML, done);
    });

});

describe('Skip html parsing & use tree from options.', function() {

    var tree = [{
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

    it('Set use tree', function(done) {
        options.skipParse = true;
        expect(posthtml()
            .process(tree, options)
            .then(function(result) {
                expect(beforeHTML).to.eql(result.html);
                done();
            }).catch(function(error) { return done(error); }));
    });
});
