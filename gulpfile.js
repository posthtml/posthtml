var gulp = require('gulp');

gulp.task('test', function() {
    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read : false }).pipe(mocha());
});

// Lint

gulp.task('lint', function() {
    var eslint = require('gulp-eslint');

    return gulp.src(['*.js', 'test/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Common
gulp.task('default', ['test', 'lint']);
