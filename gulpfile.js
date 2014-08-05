var gulp = require('gulp');
var webserver = require('gulp-webserver');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('browserify-app', function() {
    var bundler = browserify({
        entries: ['./js/main.js'],
        extensions: ['.js'],
        debug: true
    });

    var bundle = function() {
        return bundler
            .bundle()
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('.'));
    };

    return bundle();
});

gulp.task('serve', ['browserify-app'], function() {
    return gulp.src('.')
        .pipe(webserver({
            port: 1234
        })
    );
});

gulp.task('watch', function() {
    gulp.watch('./js/**', ['browserify-app']);
});

gulp.task('default', ['browserify-app', 'serve', 'watch']);
