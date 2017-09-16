const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');
const compass = require('gulp-compass');
const htmlreplace = require('gulp-html-replace');
const del = require('del');
const browserSync = require('browser-sync').create();


function compile(watch) {
  let bundler = browserify('./src/js/app.js', { debug: true }).transform(babel);

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build/js'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
}

gulp.task('css', function() {  
    return gulp.src('src/css/*.*')
        .pipe(gulp.dest('build/css'));
});

// Compile CSS from SCSS compass for development
gulp.task('css-compass', function() {
  return gulp.src('src/sass/**/*.scss')
    .pipe(compass({
        config_file: 'config.rb',
        css: 'src/css',
        sass: 'src/sass'
      }))
    .pipe(gulp.dest('build/css'))
});

gulp.task('html', function() {
  return gulp.src(['src/*.html'])
    .pipe(htmlreplace({
        'css': 'css/main.css',
        'js': 'js/build.js'
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('fonts', function() {
    return gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('build/fonts'));
});

gulp.task('favicon', function() {
    return gulp.src('src/img/ico/*.*')
        .pipe(gulp.dest('build/img/ico'));
});

// Run server for development
gulp.task('serve', function () {
   browserSync.init({
       server: 'build'
   });
});

gulp.task('clean', function () {
  
  return del.sync(['build']);
  // del(['build'], { dryRun: true }).then(paths => {
  //   console.log('Files and folders that would be deleted:\n', paths.join('\n'));
  // });
  
});

 gulp.task('build-js', function() { return compile(); });
gulp.task('watch-js', function() { return watch(); });

 gulp.task('default', ['clean', 'build-js', 'html', 'css', 'fonts', 'favicon', 'serve']);