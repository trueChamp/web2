const { src, dest, series, watch } = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleancss = require('gulp-clean-css')
const svgSprite = require('gulp-svg-sprite')
const image = require('gulp-image')
const babel = require('gulp-babel')
const notify = require('gulp-notify')
const uglify = require('gulp-uglify-es').default
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const gulpif = require('gulp-if');
const argv = require('yargs').argv
var environments = require('gulp-environments');
const browserSync = require('browser-sync').create()

var dev = environments.development;
var prod = environments.production;

const clean = () => {
    return del(['dist'])
}

const resources = () => {
    return src('src/resources/**')
        .pipe(dest('dist'))
}

const styles = () => {
    return src('src/styles/*.css')
        .pipe(dev(sourcemaps.init()))
        .pipe(concat('main.css'))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(prod(cleancss({
            level: 2
        })))
        .pipe(dev(sourcemaps.write()))
        .pipe(dest('dist'))
        .pipe(browserSync.stream())
}

const htmlMinify = () => {
    return src('src/**/*.html')
        .pipe(prod(htmlMin({
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
            'src/js/*.js',
        ])
        .pipe(dev(sourcemaps.init()))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('scripts.js'))
        .pipe(prod(uglify().on('error', notify.onError())))
        .pipe(dev(sourcemaps.write()))
        .pipe(dest('dist'))
        .pipe(browserSync.stream())
}

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
}

const images = () => {
    return src([
            'src/img/**/*.jpg',
            'src/img/768/*.jpg',
            'src/img/*.svg',
            'src/img/**/*.png',
            'src/img/**/*.jpeg',
        ])
        .pipe(prod(image()))
        .pipe(dest('dist/img'))
}

watch('src/**/*.html', htmlMinify)
watch('src/styles/**/*.css', styles)
watch('src/images/svg/**/*.svg', svgSprites)
watch('src/js/**/*.js', scripts)
watch('src/resources/**', resources)


exports.clean = clean
exports.styles = styles
exports.scripts = scripts
exports.htmlMinify = htmlMinify
exports.default = series(resources, htmlMinify, scripts, styles, images, svgSprites, watchFiles)