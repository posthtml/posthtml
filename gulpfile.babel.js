// -- used in NPM sripts

import gulp from 'gulp';

// Build

gulp.task('build:lib', () => {
    let babel = require('gulp-babel');
    return gulp.src('lib/*.js')
        .pipe(babel({ loose: 'all' }))
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json'])
        .map( i => `!${i}` );
    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', () => {
    let editor = require('gulp-json-editor');
    gulp.src('./package.json')
        .pipe(editor( (p) => {
            p.main = 'lib/posthtml';
            p.devDependencies.babel = p.dependencies.babel;
            delete p.dependencies.babel;
            return p;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);


// Changelog

gulp.task('changelog', done => {
    require('conventional-changelog')({
        preset: 'angular'
    }, (err, log) => {
        if(err) {
            return done(err);
        }

        require('fs').writeFileSync('CHANGELOG.md', log);
        done();
    });
});

// Common
gulp.task('default', () => {
    console.log('WARNING: Use NPM Scripts');
});
