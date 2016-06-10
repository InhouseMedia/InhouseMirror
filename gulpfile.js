/// <binding Clean='clean' />
"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify");

var webroot = "./wwwroot/";

var paths = {
    js: webroot + "js/**/*.js",
    minJs: webroot + "js/**/*.min.js",
    css: webroot + "css/**/*.css",
    less: webroot + "less/**/*.less",
    minCss: webroot + "css/**/*.min.css",
    concatJsDest: webroot + "js/bundle.min.js",
    concatCssDest: webroot + "css/bundle.min.css"
};

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);

// Less configuration
var less = require('gulp-less');

gulp.task('less:generate', function() {
    gulp.src(paths.less)
        .pipe(less())
        .pipe(gulp.dest(webroot + 'css/'))
});

gulp.task('less', ['less:generate', 'min:css', 'clean:css'], function() {
    gulp.watch(paths.less, ['less:generate', 'min:css', 'clean:css'], {base: './less/'});
});

gulp.task('script', ['min:js', 'clean:js'], function(){
    gulp.watch(paths.js, ['min:js', 'clean:js']);
});