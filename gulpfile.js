'use strict'

const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const babel = require('gulp-babel')
const include = require('gulp-include')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const mmq = require('gulp-merge-media-queries')
const cleancss = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const svgSprite = require('gulp-svg-sprite')
const svgmin = require('gulp-svgmin')
const del = require('del')
const nunjucksRender = require('gulp-nunjucks-render')
const data = require('gulp-data')
const fs = require('fs')
const removeHtmlComments = require('gulp-remove-html-comments')
const beautify = require('gulp-beautify')
const rename = require('gulp-rename')

sass.compiler = require('node-sass')

gulp.task('browser-sync', () => {
  browserSync.init({
    server: { baseDir: './dist/' },
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
      './src/js/**/*.js'
    ])
    .pipe(
      babel({
        presets: ['@babel/env']
        // ignore: ['./node_modules/@glidejs/glide/dist/glide.min.js']
      })
    )
    .pipe(include())
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest('./dist/assets/js/'))
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/assets/js/'))
    .pipe(browserSync.stream())
})

gulp.task('main-style', () => {
  return gulp
    .src('./src/scss/main.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(concat('styles.min.css'))
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 3 versions'], grid: true })
    )
    .pipe(mmq())
    .pipe(
      cleancss({
        compatibility: 'ie11',
        level: 2
      })
    )
    .pipe(gulp.dest('./dist/assets/css/'))
    .pipe(browserSync.stream())
})

gulp.task('styles', () => {
  return gulp
    .src(['./src/scss/**/*.{scss,css}', '!./src/scss/main.scss'])
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 3 versions'], grid: true })
    )
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest('./dist/assets/css/'))
    .pipe(browserSync.stream())
})

gulp.task('images', () => {
  return gulp
    .src('./src/img/**/*')
    .pipe(newer('./dist/assets/img/'))
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/assets/img/'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('svg', () => {
  return gulp
    .src('./src/svg/**/*.svg')
    .pipe(
      svgmin({
        plugins: [
          {
            removeViewBox: false
          }
        ]
      })
    )
    .pipe(gulp.dest('./dist/assets/icons/'))
    .pipe(
      svgSprite({
        svg: {
          rootAttributes: {
            id: 'symbol.svg',
            'aria-hidden': 'true'
          }
        },
        mode: {
          symbol: {
            inline: true,
            sprite: 'symbol.svg',
            dest: '.'
          }
        }
      })
    )
    .pipe(gulp.dest('./src/templates/sprite/'))
    .pipe(gulp.dest('./dist/assets/icons/'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('html', () => {
  return (
    gulp
      .src('./src/pages/**/*.{html,njk}')
      .pipe(
        data(function () {
          return JSON.parse(fs.readFileSync('./src/nunjucks-data.json'))
        })
      )
      .pipe(
        nunjucksRender({
          path: ['./src/templates/']
        })
      )
      // .on('error', console.log)
      .pipe(removeHtmlComments())
      .pipe(beautify.html({ indent_size: 2 }))
      .pipe(gulp.dest('./dist'))
      .pipe(browserSync.reload({ stream: true }))
  )
})

gulp.task('fonts', () => {
  return gulp
    .src('./src/fonts/**/*.{woff,woff2,ttf,otf,eot,svg}')
    .pipe(gulp.dest('./dist/assets/fonts/'))
})

gulp.task('clean', () => {
  return del('./dist/')
})

gulp.task(
  'build',
  gulp.series(
    'clean',
    'svg',
    'main-style',
    'styles',
    'scripts',
    'images',
    'fonts',
    'html'
  )
)

gulp.task('watch', () => {
  gulp.watch('./src/scss/**/*', gulp.parallel('styles', 'main-style'))
  gulp.watch(
    ['./src/nunjucks-data.json', './src/**/*.{html,njk}'],
    gulp.parallel('html')
  )
  gulp.watch('./src/**/*.js', gulp.parallel('scripts'))
  gulp.watch('./src/img/**/*', gulp.parallel('images'))
  gulp.watch('./src/svg/**/*.svg', gulp.parallel('svg'))
  gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'))
})

gulp.task(
  'default',
  gulp.series('build', gulp.parallel('browser-sync', 'watch'))
)
