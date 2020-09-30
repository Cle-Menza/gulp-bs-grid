let preprocessor = 'sass'
const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const mmq = require('gulp-merge-media-queries')
const cleancss = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const svgSprite = require('gulp-svg-sprite')
const svgmin = require('gulp-svgmin')
const del = require('del')
const include = require('gulp-include')

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {baseDir: './dist/'},
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
      './src/js/scripts.js',
    ])
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browserSync.stream())
})

gulp.task('styles', () => {
  return gulp
    .src('./src/' + preprocessor + '/main.' + preprocessor + '')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(concat('main.min.css'))
    .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true}))
    .pipe(mmq())
    .pipe(cleancss({
      compatibility: 'ie9',
      level: {1: {specialComments: 0}},
      format: 'keep-breaks'
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.stream())
})

gulp.task('images', () => {
  return gulp
    .src('./src/img/**/*')
    // .pipe(newer('./src/img/'))
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/img/'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('svg', () => {
  return gulp
    .src('./src/svg/**/*.svg')
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
          sprite: 'symbol.svg',
          dest: '.'
        }, // Activate the «symbol» mode
        // stack: false // Create a «stack» sprite
      }
    })
    )
    .pipe(gulp.dest('./dist/icons/'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('html', () => {
  return gulp
    .src('./src/*.html')
    .pipe(include())
    .on('error', console.log)
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('fonts', () => {
  return gulp
    .src('./src/fonts/**/*')
    .pipe(gulp.dest('./dist/fonts/'))
});

gulp.task('clean', () => {
  return del('./dist/')
})

gulp.task('build',
  gulp.series('clean',
    gulp.parallel(
      'html',
      'styles',
      'scripts',
      'images',
      'svg',
      'fonts',
    )
  )
)

gulp.task('watch', () => {
  gulp.watch('./src/' + preprocessor + '/**/*', gulp.parallel('styles'))
  gulp.watch('./src/**/*.html', gulp.parallel('html'))
  gulp.watch('./src/**/*.js', gulp.parallel('scripts'))
  gulp.watch('./src/img/**/*', gulp.parallel('images'))
  gulp.watch('./src/svg/**/*.svg', gulp.parallel('svg'))
  gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'))
})

gulp.task('default', gulp.series(
  'build',
  gulp.parallel('browser-sync', 'watch')
))
