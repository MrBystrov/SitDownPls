const { src, dest , series, watch } = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const svgSprite = require('gulp-svg-sprite')
const image = require('gulp-image')
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel')
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const gulpif = require('gulp-if')
const sass = require('gulp-sass')(require('sass'))
const fileinclude = require('gulp-file-include');

let prod = false;

const sassFunc = () => {
    return src('src/scss/main.scss')
    .pipe(sass())
    .pipe(dest('src/styles'))
}

const isProd = (done) => {
    prod = true;
    done();
}

const clean = () => {
    return del(['dist'])
}

const resources = ()=> {
    return src('src/resources/**')
    .pipe(dest('dist'))
}

const fonts = ()=> {
    return src('src/fonts/**')
    .pipe(dest('dist/fonts'))
}

const styles = () => {
    return src('src/styles/**/*.css')
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
        cascade: false,
    }))
    .pipe(gulpif(prod, cleanCSS({
        level: 2
    })))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const htmlHandling = () => {
    return src([
        './src/**/*.html', 
        '!./src/template/*.html'
    ])
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(gulpif(prod, htmlMin({
        collapseWhitespace: true,
    })))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}


const svgSprites = () => {
    return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: '../sprite.svg'
            }
        }
    }))
    .pipe(dest('dist/images'))
}

const scripts = () => {
    return src([
        'src/js/components/**/*.js',
        'src/js/main.js',
    ])
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(gulpif(prod, babel({
        presets: ['@babel/env']
    })))
    .pipe(concat('app.js'))
    .pipe(gulpif(prod, uglify().on('error', notify.onError())))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const images = () => {
    return src([
      'src/images/**/*.jpg',
      'src/images/**/*.webp',
      'src/images/**/*.png',
      'src/images/*.svg',
      'src/images/**/*.jpeg',
    ])  
    .pipe(image())
    .pipe(dest('dist/images'))
  }
  

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        browser: 'firefox'
    })
}

watch('src/**/*.html', htmlHandling)
watch('src/styles/**/*.css', styles)
watch('src/images/svg/**/*.svg', svgSprites)
watch('src/js/**/*.js', scripts)
watch('src/resources/**', resources)
watch('src/fonts/**', fonts)
watch('src/scss/**/*.scss', sassFunc)



exports.styles = styles
exports.htmlMinify = htmlHandling
exports.scripts = scripts
exports.dev = series(clean, htmlHandling, resources, fonts, scripts, sassFunc, styles, images, svgSprites, watchFiles)
exports.build = series(isProd, clean, htmlHandling, resources, fonts, scripts, sassFunc,  styles, images, svgSprites, watchFiles)