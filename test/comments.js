/* jshint mocha: true, maxlen: false */
var posthtml = require('../lib/posthtml');
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');

var comments = fs.readFileSync(path.resolve(__dirname, 'templates/comments.html'), 'utf8').toString();

function test(html, reference, done) {
    posthtml().process(html).then(function(result) {
        expect(reference).to.eql(result.html);
        done();
    }).catch(function(error) { return done(error); });
}

describe('Parse comments', function() {
    it('comments eqval', function(done) {
        test(comments, comments, done);
    });
});
