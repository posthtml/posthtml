/* jshint mocha: true, maxlen: false */
var posthtml = require('../lib/posthtml');
var expect = require('chai').expect;

var text = 'text';

function test(html, reference, done) {
    posthtml().process(html).then(function(result) {
        expect(reference).to.eql(result.html);
        done();
    }).catch(function(error) { return done(error); });
}

describe('Parse text', function() {
    it('Text eqval', function(done) {
        test(text, text, done);
    });
});
