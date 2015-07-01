import gulp from 'gulp';
import path from 'path';
import fs   from 'fs-extra';

gulp.task('clean', (done) => {
    fs.remove(path.join(__dirname, 'build'), done);
});

// Build

gulp.task('build:lib', ['clean'], () => {
    let babel = require('gulp-babel');
    return gulp.src('lib/*.js')
        .pipe(babel({ loose: 'all' }))
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json'])
        .map( i => '!' + i );
    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], () => {
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

// Lint

gulp.task('lint', function() {
    let eslint = require('gulp-eslint');

    return gulp.src(['*.js', 'test/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


gulp.task('test', function() {
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read : false }).pipe(mocha({ reporter: 'spec'}));
});

// Common
gulp.task('default', ['test', 'lint']);
