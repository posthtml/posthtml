var fs = require('fs'),
    util = require('util'),
    repository = require('./package.json').repository.url;

require('conventional-changelog')({
    repository: repository,
    commitLink: function(hash) {
        return util.format(
            '[%s](%s/commits/%s)',
            hash.substring(0, 7),
            repository,
            hash
        );
    },
    version: require('./package.json').version
}, function(err, log) {
    fs.writeFileSync('CHANGELOG.md', log);
});
