// Theme name
const themeName = 'solarfam-ds';

// Gulp plugins
const	gulp = require("gulp");
const	plumber = require("gulp-plumber");
const	gulpsass = require("gulp-sass");
const	autoprefixer = require("gulp-autoprefixer");
const	cleanCss = require("gulp-clean-css");
const	sourceMaps = require("gulp-sourcemaps");
const	concat = require("gulp-concat");
const	jshint = require("gulp-jshint");
const	uglify = require("gulp-uglify");
const	imagemin = require("gulp-imagemin");
const	browserSync = require('browser-sync').create();
const	reload = browserSync.reload;
const	svgmin = require("gulp-svgmin");
const	svgstore = require ("gulp-svgstore");
const	cheerio = require ("gulp-cheerio");
const 	zip = require('gulp-zip');
const htmlPartial = require('gulp-html-partial');

var onError = function(err)	{
	console.log("Se ha producido un error: ", err.message);
	this.emit("end");
};


// Paths
const devPaths = {
	sass: './dev/sass/',
	js: './dev/js/',
	img: './dev/img/',
	icons: './dev/icons/',
	src: './dev/src',
};

const distPaths = {
  	js: './assets/js/',
  	img: './assets/img/',
  	icons: './assets/icons/',
  	fonts: './assets/fonts/',
  	css: './assets/css/',
  };

// Files to watch
const watchFiles = {
	sass: './dev/sass/**/*',
	js: './dev/js/**/*',
	img: './dev/img/**/*.*',
	icons: './assets/icons/*.svg',
	fonts: './dev/fonts/',
	html: './dev/src',
};

// Browser Sync proxy direction
const proxySync = 'local-host/' + themeName;


// Gulp TASK
gulp.task("sass", function(){
	return gulp.src(devPaths.sass + 'style.scss')
		.pipe(plumber({errorHandler:onError}))
		.pipe (sourceMaps.init())
		.pipe (gulpsass())
		.pipe (autoprefixer("last 3 versions"))
		.pipe (cleanCss({keepSpecialComments: 1}))
		.pipe (sourceMaps.write("."))
		.pipe (gulp.dest("./"))
});


gulp.task("javascript", function(){
	return gulp.src(devPaths.js + '**/*.js')
		.pipe(plumber({errorHandler:onError}))
		.pipe(jshint())
		.pipe (concat(themeName + '.min.js'))
		.pipe (uglify())
		.pipe (gulp.dest(distPaths.js));

});

gulp.task("imagemin", function(){
	return gulp.src(devPaths.img + '**/*.*')
		.pipe(plumber({errorHandler:onError}))
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest(distPaths.img));

});

gulp.task('icons', function () {
  return gulp.src(devPaths.icons + 'sprite-icons/*.svg')
    .pipe(plumber({errorHandler:onError}))
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: false
    }))
    .pipe(cheerio({
      run: function ($, file) {
          $('svg').addClass('hide-svg');
          $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(gulp.dest(distPaths.icons));

});

// Html partials
gulp.task('html', function () {
    return gulp.src(devPaths.src + '/*.html')
        .pipe(htmlPartial({
            basePath: 'dev/src/partials/'
        }))
        .pipe(gulp.dest('.'));
});

// Browser Sync
gulp.task('browser-sync', function() {
	var files = [
		'**/*.html',
		'**/*.{png,jpg,gif,svg}',
		"**/*.css",
	];
	browserSync.init(files, {
		server: {
         baseDir: "C:/local-host/solarfam-ds",
				 index: "index.html"
      },
		liveReload: false,
		watch: true,
		open: false,
		browser: ["google chrome", "firefox"],
		injectChanges: false

	});
});


// Zip files up
gulp.task('build', function () {
	return gulp.src([
	  '*',
	  './assets/**/*',
	  './src/**/*',
	  '!dev',
	  '!dist',
	  '!.gitignore',
	  '!.package.json',
	  '!.package-lock.json',
	  '!./node_modules',
	  '!./releases'
	 ], {base: "."})
	 .pipe(zip(themeName + '.zip'))
	 .pipe(gulp.dest('./dist'));
   });


// Gulp watching where magic happen
gulp.task( 'watch', function() {

	// don't listen to whole js folder, it'll create an infinite loop
	gulp.watch( watchFiles.js, gulp.parallel('javascript') );
	gulp.watch( watchFiles.sass, gulp.parallel('sass') );
	gulp.watch( watchFiles.img, gulp.parallel('imagemin') );
	gulp.watch( watchFiles.icons, gulp.parallel('icons') );
	gulp.watch( watchFiles.html, gulp.parallel('html') );

  } );

  gulp.task( 'default', gulp.parallel('watch', 'browser-sync'));
