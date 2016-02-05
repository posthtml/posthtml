/* jshint mocha: true, maxlen: false */
var posthtml = require('../lib/posthtml');
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');

var doctype = fs.readFileSync(path.resolve(__dirname, 'templates/doctype.html'), 'utf8').toString();

function test(html, reference, done) {
    posthtml().process(html).then(function(result) {
        expect(reference).to.eql(result.html);
        done();
    }).catch(function(error) { return done(error); });
}

describe('Parse Doctype', function() {

    it('doctype eqval', function(done) {
        test(doctype, doctype, done);
    });

});
