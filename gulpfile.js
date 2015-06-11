// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
// var cdnify = 

// Lint Task
gulp.task('lint', function() {
    return gulp.src(['js/*.js', '!js/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Copy index and other html files
gulp.task('html', function() {
    return gulp.src(['./*.html', '!./*.min.html'])
        .pipe(gulp.dest('dist'));
});


// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(['js/*.js', '!js/*.min.js'])
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
    // just includes minified js
    gulp.src(['js/*.min.js', '!js/*.js'])
        .pipe(gulp.dest('dist/js'));
});

// Concatenate and Minify Css
gulp.task('cssmin', function () {
    gulp.src(['css/*.css', '!css/*.min.css'])
        .pipe(rename({suffix: '.min'}))
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'));
    // just includes minified css
    gulp.src(['css/*.min.css', '!css/*.css'])
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
gulp.task('default', ['lint', 'scripts', 'cssmin', 'html', 'watch']);