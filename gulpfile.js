// op de eerste regel zetten we steeds de gulp methods
const { src, series, parallel, dest, watch } = require("gulp");

// plugins variabelen
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const browsersync = require("browser-sync").create();
const fileinclude = require('gulp-file-include');
const uglifyes = require('gulp-uglify-es').default;


// compileer scss, zet sourcemaps aan, autoprefix, minify, rename en schrijf naar dist/css
function compile() {
    return src("src/scss/*.scss", { sourcemaps: true })
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename("*.min.css"))
        .pipe(dest("dist/css", { sourcemaps: "." }));
}

// minify html en schrijf naar dist
function html() {
    return src("*.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest("dist"));
}

function js() {
    return src("src/js/*.js", { sourcemaps: true })
        .pipe(
            fileinclude({
                prefix: '@@',
            })
        )
        .pipe(uglifyes())
        .pipe(
            rename({
                extname: '.min.js',
            })
        )
        .pipe(dest("dist/js", { sourcemaps: "." }));
}

// comprimeer afbeeldingen en voeg ze doe aan dist/img
function images() {
    return src("src/img/*").pipe(imagemin()).pipe(dest("dist/img"));
}

// maak een server aan en sync de browser
function sync(cb) {
    browsersync.init({
        server: {
            baseDir: '.',
        },
    });
    cb();
}

// refresh bij iedere wijziging
function syncReload(cb) {
    browsersync.reload();
    cb();
}

// hou alle taken in de gaten met de watch method en refresh na iedere wijziging
function watcher() {
    watch(["*.html"], series(html, syncReload));
    watch(["src/img/*"], series(images, syncReload));
    watch(["src/scss/**/*.scss"], series(compile, syncReload));
    watch(["src/js/*"], series(js, syncReload));
}

// voer eventueel een taak apart uit om te testen/debuggen; voer ze uit met het commando "gulp taaknaam"
exports.compile = compile;
exports.html = html;
exports.images = images;
exports.js = js;

// de default taak voer je uit met het commando "gulp"
exports.default = series(compile, html, js, images, sync, watcher);

