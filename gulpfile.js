var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var gzip = require('gulp-gzip');
var multistream = require('gulp-multistream');
var strip = require('gulp-strip-comments');
var plumber = require('gulp-plumber');
var gulpSequence = require('gulp-sequence');
var ngAnnotate = require('gulp-ng-annotate');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var merge = require('merge-stream');
var htmlmin = require('gulp-htmlmin');
var stage = process.env.STAGE || 'development';
var config = require('./config')[stage];

gulp.task('default', ['sass', 'fonts', 'jade', 'images', 'js']);
gulp.task('js', ['jsConcat', 'jsMin', 'jsGzip']);

gulp.task('fonts', function (done) {
	gulp.src(['./src/js/lib/font-awesome/fonts/*', './src/js/lib/bootstrap/dist/fonts/*'])
		.pipe(multistream(
			gulp.dest('./web/fonts'),
			gulp.dest('./www/fonts'),
			gulp.dest('./electron/fonts')
		)).on('end', done);
});

gulp.task('sass', function(done) {

	gulp.src('./src/scss/**/**/*.app.scss')
	.pipe(sass())
	.on('error', sass.logError)
	.pipe(multistream(
		gulp.dest('./web/css/'),
		gulp.dest('./www/css/'),
		gulp.dest('./electron/css/')
	))
	.pipe(minifyCss({
		keepSpecialComments: 0
	}))
	.pipe(rename({ extname: '.min.css' }))
	.pipe(multistream(
		gulp.dest('./web/css/'),
		gulp.dest('./www/css/'),
		gulp.dest('./electron/css/')
	))
	.on('end', function () {
		gulp.src([
			'./src/js/lib/swiper/dist/css/swiper.min.css',
			'./www/css/main.app.min.css',
			'./src/js/lib/font-awesome/css/font-awesome.min.css'
		]).pipe(concat('styles.min.css'))
		.pipe(minifyCss({
			keepSpecialComments: 0
		}))
		.pipe(multistream(
			gulp.dest('./web/css/'),
			gulp.dest('./www/css/'),
			gulp.dest('./electron/css/')
		))
		// .pipe(rename('styles.min.css.gzip'))
		.pipe(gzip())
		.pipe(multistream(
			gulp.dest('./web/css/'),
			gulp.dest('./www/css/'),
			gulp.dest('./electron/css/')
		)).on('end', done)
	});
});

gulp.task('jade', function(done) {
	gulp.src('./src/views/index.jade')
	.pipe(jade({
		locals : {
			ionic: true,
			dev: true,
			config: config
		},
		pretty : true,
		doctype: 'html'
	}))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest('./www/'))
	.on('end', function(){
		done();
	});

	gulp.src('./src/views/index.jade')
	.pipe(jade({
		locals : {
			electron: true,
			dev: true,
			config: config
		},
		pretty : true,
		doctype: 'html'
	}))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest('./electron/'));

	gulp.src('./src/views/index.jade')
	.pipe(jade({
		locals : {
			dev: true,
			config: config
		},
		pretty : true,
		doctype: 'html'
	}))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest('./web/'));
});

gulp.task('images', function(done){
	gulp.src('./src/img/**/*')
	.pipe(imagemin())
	.pipe(multistream(
		gulp.dest('./web/img'),
		gulp.dest('./www/img'),
		gulp.dest('./electron/img')
	)).on('end', done);
	// [
	// 	imagemin.gifsicle({interlaced: true}),
	// 	imagemin.jpegtran({progressive: true}),
	// 	imagemin.optipng({optimizationLevel: 5}),
	// 	imagemin.svgo({plugins: [{removeViewBox: true}]})
	// ]
	// gulp.src('./src/js/lib/intl-tel-input/build/img/*', {base: './src/js/lib/intl-tel-input/build/img'})
	// 	.pipe(multistream(
	// 		gulp.dest('./web/img'),
	// 		gulp.dest('./www/img'),
	// 		gulp.dest('./electron/img')
	// ));
});

gulp.task('jsConcat', function() {
	try {
		gulp.src([
			'./src/js/lib/angular/angular.min.js',
			'./src/js/lib/jquery/dist/jquery.min.js',
			'./src/js/lib/angular-ui-router/release/angular-ui-router.min.js',
			'./src/js/lib/angular-ui-utils/ui-utils.js',
			'./src/js/lib/angular-sanitize/angular-sanitize.min.js',
			'./src/js/lib/angular-animate/angular-animate.min.js',
			'./src/js/lib/ui-router-metatags/dist/ui-router-metatags.min.js',
			'./src/js/lib/lodash/dist/lodash.min.js',
			'./src/js/custom/counter_flipper.js',
			'./src/js/lib/imagesloaded/imagesloaded.pkgd.min.js',
			'./src/js/lib/masonry/dist/masonry.pkgd.js',
			'./src/js/lib/swiper/dist/js/swiper.min.js',
			'./src/js/lib/isotope/dist/isotope.pkgd.min.js',
			'./src/js/lib/intl-tel-input/build/js/intlTelInput.min.js',
			'./src/js/lib/fancyBox/dist/jquery.fancybox.min.js',
			'./src/js/lib/select2/dist/js/select2.full.min.js',
			'./src/js/lib/javascript-load-image/js/load-image.all.min.js',
			'./src/js/util.js',
			'./src/js/app.js',
			'./src/js/directives.js',
			'./src/js/settings.js',
			'./src/js/controllers/*.js',
			'./src/js/config.js'
		])
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(concat('all.js', { newLine: '\n;' }))
		.pipe(sourcemaps.write())
		.pipe(multistream(
			gulp.dest('./web/js'),
			gulp.dest('./www/js'),
			gulp.dest('./electron/js')
		))
		// .pipe(rename('all.min.js'))
		// .pipe(ngAnnotate({
		// 	add: true
		// }))
		// .pipe(uglify())
		// .on('error', function(err){
		// 	console.log(err)
		// })
		// .pipe(multistream(
		// 	gulp.dest('./web/js'),
		// 	gulp.dest('./www/js'),
		// 	gulp.dest('./electron/js')
		// ))
		// .pipe(gzip())
		// .pipe(multistream(
		// 	gulp.dest('./web/js'),
		// 	gulp.dest('./www/js'),
		// 	gulp.dest('./electron/js')
		// ))
		.on('end', function () {
			gulp.src('./src/js/lib/intl-tel-input/build/js/utils.js')
				.pipe(uglify())
				.pipe(rename('utils.min.js'))
				.pipe(multistream(
					gulp.dest('./web/js'),
					gulp.dest('./www/js'),
					gulp.dest('./electron/js')
				))
				.pipe(gzip())
				.pipe(multistream(
					gulp.dest('./web/js'),
					gulp.dest('./www/js'),
					gulp.dest('./electron/js')
				))
		});
		gulp.src(['./src/js/lib/ionic/**/*','./src/js/lib/ngCordova/dist/*.js'], {base: './src/js/lib/'})
		.pipe(gulp.dest('./www/lib/'));
		// gulp.src(['./src/js/lib/animate.css/animate.min.css'])
		// .pipe(multistream(
		// 	gulp.dest('./web/js/lib/animate.css/'),
		// 	gulp.dest('./electron/js/lib/animate.css/'),
		// 	gulp.dest('./www/js/lib/animate.css/')
		// ));
	} catch (e) {
		console.log('error while concat')
	}
});

gulp.task('jsMin', ['jsConcat'], function() {
	gulp.src('./web/js/all.js')
		.pipe(ngAnnotate({
			add: true
		}))
		.pipe(uglify())
		.on('error', function(err){
			console.log(err)
		})
		.pipe(rename('all.min.js'))
		.pipe(multistream(
			gulp.dest('./web/js'),
			gulp.dest('./www/js'),
			gulp.dest('./electron/js')
		))
		//.on('end', done);
})

gulp.task('jsGzip', ['jsConcat','jsMin'], function() {
	gulp.src('./web/js/all.min.js')
		.pipe(gzip())
		// .pipe(rename('all.min.js.gzip'))
		.pipe(multistream(
			gulp.dest('./web/js'),
			gulp.dest('./www/js'),
			gulp.dest('./electron/js')
		))
		//.on('end', done);
})

// gulp.task('js', gulpSequence('jsConcat', 'jsMin', 'jsGzip'));


gulp.task('watch', function() {
	gulp.watch(['./src/views/**/**/*.jade'],['jade']);
	gulp.watch(['./src/scss/**/**/*.scss'], ['sass']);
	gulp.watch(['./src/js/**/**/*.js'],     ['js']);
	gulp.watch(['./src/img/*'],             ['images']);
});
