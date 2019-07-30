const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const del = require('del');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { argv } = require('yargs');

const $ = gulpLoadPlugins();
const server = browserSync.create();

const port = argv.port || 9000;


function styles() {
  return src('src/scss/**/*.scss')
    .pipe($.plumber())
    .pipe(concat('styles.min.css'))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(rename('styles.min.css'))
    .pipe(dest('./dist/'))
    .pipe(server.reload({stream: true}));
}

function scripts() {
  return src('src/js/**/*.js')
    .pipe($.plumber())
    .pipe(concat('script.min.js'))
    .pipe($.babel())
    .pipe($.uglify({compress: {drop_console: true}}))
    .pipe(rename('script.min.js'))
    .pipe(dest('./dist/'))
    .pipe(server.reload({stream: true}));
}

const lintBase = files => {
  return src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(server.reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!server.active, $.eslint.failAfterError()));
};

function lint() {
  return lintBase('src/js/**/*.js')
    .pipe(dest('src/js'));
}

function images() {
  return src('src/img/**/*', { since: lastRun(images) })
  .pipe($.imagemin())
  .pipe(dest('./dist/img/'));
}

function fonts() {
  return src('src/fonts/**/*.{eot,svg,ttf,woff,woff2}')
  .pipe(dest('./dist/fonts'));
};

function clean() {
  return del(['dist'])
}

function measureSize() {
  return src('dist/**/*')
  .pipe($.size({title: 'build', gzip: true}));
}

const build = series(
  clean,
  parallel(
    lint,
    series(parallel(styles, scripts)),
    images,
    fonts),
    measureSize
    );

    function startAppServer() {
      server.init({
        notify: false,
        port,
        server: {
          baseDir: ['./'],
          routes: {
            '/node_modules': 'node_modules'
          }
        }
      });

      watch([
        'src/img/**/*',
        '.src/fonts/**/*',
        './index.html'
      ]).on('change', server.reload);
      watch('src/scss/**/*.scss', styles);
      watch('src/js/**/*.js', scripts);
      watch('src/fonts/**/*', fonts);
    }

const dev = series(clean, parallel(styles, scripts, images, fonts), startAppServer);

    exports.dev = dev;
    exports.build = build;
    exports.default = build;
