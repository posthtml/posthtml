/* jshint mocha: true, maxlen: false */
var expect = require('chai').expect;
var parser = require('posthtml-parser');
var render = require('posthtml-render');
var path = require('path');
var fs = require('fs');

var html = fs.readFileSync(path.resolve(__dirname, 'templates/parser.html'), 'utf8').toString();

describe('Parser', function() {
    it('parser => render', function(done) {
        expect(html).to.eql(render(parser(html)));
        done();
    });
});
