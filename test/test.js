var posthtml = require('../index.js');
var expect = require('chai').expect;

var beforeHTML = '<div class="button"><div class="button__text">Text</div></div>';

var test = function (html, done) {
    posthtml().process(html).then(function (result) {
        expect(beforeHTML).to.eql(result);
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('Simple text', function () {

    it('html eqval', function (done) {
        test(beforeHTML, done);
    });

    it('minifer \\n', function (done) {
        test('<div class="button">\n<div class="button__text">Text</div>\n</div>', done);
    });

});
