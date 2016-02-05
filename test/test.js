/* jshint mocha: true, maxlen: false */
var posthtml = require('../lib/posthtml');
var expect = require('chai').expect;

var beforeHTML = '<div class="button"><div class="button__text">Text</div></div>';

function test(html, done) {
    posthtml().process(html).then(function(result) {
        expect(beforeHTML).to.eql(result.html);
        done();
    }).catch(function(error) { return done(error); });
}

describe('Simple text', function() {
    it('html eqval', function(done) {
        test(beforeHTML, done);
    });
});
