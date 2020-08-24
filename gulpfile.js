let preprocessor    = 'sass'
const gulp          = require('gulp')
const browserSync   = require('browser-sync').create()
const concat        = require('gulp-concat')
const uglify        = require('gulp-uglify-es').default
const sass          = require('gulp-sass')
const autoprefixer  = require('gulp-autoprefixer')
const mmq           = require('gulp-merge-media-queries')
const cleancss      = require('gulp-clean-css')
const imagemin      = require('gulp-imagemin')
const newer         = require('gulp-newer')
const svgSprite     = require('gulp-svg-sprite')
const svgmin        = require('gulp-svgmin')
const del           = require('del')

gulp.task('browser-sync', () => {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    open: false
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  })
})

gulp.task('scripts', () => {
  return gulp
    .src([
      // 'node_modules/jquery/dist/jquery.min.js',
      'app/js/main.js',
      ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js/'))
    .pipe(browserSync.stream())
})

gulp.task('styles', () => {
  return gulp
    .src('app/' + preprocessor + '/main.' + preprocessor + '')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(concat('main.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(mmq())
    .pipe(cleancss( {
      compatibility: 'ie9',
      level: { 1: { specialComments: 0 } }, 
      format: 'keep-breaks'
    } ))
    .pipe(gulp.dest('app/css/'))
    .pipe(browserSync.stream())
})

gulp.task('clean-img', () => {
  return del(['app/img/*.png', 'app/img/*.jpg', 'app/img/*.svg', 'app/img/*.jpeg', '!app/img/src/', '!app/img/favicon/'])
})

gulp.task('images', () => {
  return gulp
    .src('app/img/src/**/*')
    .pipe(newer('app/img/'))
    .pipe(imagemin())
    .pipe(gulp.dest('app/img/'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('clean-svg', () => {
  return del(['app/icons/**'])
})

gulp.task('svg', () => {
  return gulp
  .src('app/svg/**/*.svg')
  .pipe(svgmin({
      plugins: [{
        removeViewBox: false
      }]
  }))
  .pipe(svgSprite({
  shape: {
    dimension: { // Set maximum dimensions
    maxWidth: 512, // Max. shape width
    maxHeight: 512, // Max. shape height
    precision: 2, // Floating point precision
    attributes: false, // Width and height attributes on embedded shapes
    },
    spacing: { // Add padding
    padding: 0
    },
    dest: 'svg' // Keep the intermediate files
  },
  svg: { // General options for created SVG files
    xmlDeclaration: true, // Add XML declaration to SVG sprite
    doctypeDeclaration: true, // Add DOCTYPE declaration to SVG sprite
    namespaceIDs: true, // Add namespace token to all IDs in SVG shapes
    namespaceIDPrefix: '', // Add a prefix to the automatically generated namespaceIDs
    namespaceClassnames: true, // Add namespace token to all CSS class names in SVG shapes
    dimensionAttributes: true, // Width and height attributes on the sprite
  },
  mode: {
    symbol: {
      inline: true,
    }, // Activate the «symbol» mode
    stack: true // Create a «stack» sprite
  }
  })
	)
  .pipe(gulp.dest('app/icons/'))
  .pipe(browserSync.reload({ stream: true }))
})

gulp.task('watch', () => {
  gulp.watch('app/' + preprocessor + '/**/*', gulp.parallel('styles'))
  gulp.watch('app/**/*.html').on('change', browserSync.reload)
  // gulp.watch('app/**/*.html', browserSync.reload)
  gulp.watch(['app/**/*.js', '!app/**/*.min.js'], gulp.parallel('scripts'))
  gulp.watch('app/img/src/**/*', gulp.series('clean-img', 'images'))
  gulp.watch('app/svg/**/*.svg', gulp.series('clean-svg', 'svg'))
})

gulp.task('default', gulp.series(
  gulp.parallel('browser-sync', 'watch')
))