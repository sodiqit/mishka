var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var del = require('del');
var tinypng = require('gulp-tinypng-compress');

gulp.task('style', async function() {
  gulp.src('source/sass/style.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(gulp.dest('build/css'))
  .pipe(minify())
  .pipe(rename('style_min.css'))
  .pipe(gulp.dest('build/css/'))
  .pipe(server.stream());
});

gulp.task('serve', async function() {
  server.init({
    server: {
      baseDir:"build/"
    },
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch('source/*.html', gulp.series('html'));
  gulp.watch('source/*.html').on('change', server.reload);
});

gulp.task('images', async function() {
  return gulp.src('source/images/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive:true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest('source/images'));
});

gulp.task('tinypng', async function () {
    gulp.src('source/images/**/*.{png,jpg,jpeg}')
        .pipe(tinypng({
            key: 'uztwkAvHaPiax2dE06qmRQnSwsuoZgSd',
            log: true
        }))
        .pipe(gulp.dest('source/images'));
});

gulp.task('webp', async function() {
  gulp.src('source/images/**/*.{png,jpg}')
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest('source/images'));
});

gulp.task('sprite', function() {
  return gulp.src('source/images/icon-*.svg')
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/images'));
});

gulp.task('html', function() {
  return gulp.src('source/*.html')
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest('build'));
});

gulp.task('copy', function() {
  return gulp.src([
    'source/fonts/**/*.{woff,eot}',
    'source/images/**',
    'source/js/**'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('build', gulp.series('clean', 'copy', 'style', 'sprite', 'html'));
