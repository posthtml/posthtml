var posthtml = require('../index.js'),
    expect = require('chai').expect,
    beforeHTML = '<div class="button"><div class="button__text">Text</div></div>';

function test(html, done) {
    posthtml().process(html).then(function (result) {
        expect(beforeHTML).to.eql(result);
        done();
    }).catch(function (error) {
        done(error);
    });
}

describe('Simple text', function () {

    it('html eqval', function (done) {
        test(beforeHTML, done);
    });

    it('minifer \\n', function (done) {
        test('<div class="button">\n<div class="button__text">Text</div>\n</div>', done);
    });

});
