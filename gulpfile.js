// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var cdnify = 

// Lint Task
gulp.task('lint', function() {
    return gulp.src(['js/*.js', '!js/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(['js/*.js', '!js/*.min.js'])
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// Concatenate and Minify Css
gulp.task('cssmin', function () {
    gulp.src(['css/*.css', '!css/*.min.css'])
        .pipe(rename({suffix: '.min'}))
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'));
});

//cdnify
// gulp.src [
//    'dist/**/*.{css,html}'
// ]
// .pipe $.cdnify(
//     base: "http://pathto/your/cdn/"
//   )
// .pipe(gulp.dest('dist/'))

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('css/*.css', ['cssmin']);
});

// Default Task
gulp.task('default', ['lint', 'scripts', 'cssmin','watch']);