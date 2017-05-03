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
var multistream = require('gulp-multistream');
var stage = process.env.STAGE || 'development';
var config = require('./config')[stage];

gulp.task('default', ['sass', 'jade', 'js', 'images']);

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
	.on('end', done);
	gulp.src('./src/js/lib/font-awesome/css/*', {base: './src/js/lib/font-awesome/css/'})
	.pipe(multistream(
		gulp.dest('./web/css'),
		gulp.dest('./www/css'),
		gulp.dest('./electron/css')
	));
	gulp.src('./src/js/lib/font-awesome/fonts/*', {base: './src/js/lib/font-awesome/fonts/'})
	.pipe(multistream(
		gulp.dest('./web/fonts'),
		gulp.dest('./www/fonts'),
		gulp.dest('./electron/fonts')
	));
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
	.pipe(gulp.dest('./web/'));
});

gulp.task('images', function(done){
	gulp.src('./src/img/**/*', {base: './src/img/'})
	.pipe(multistream(
		gulp.dest('./web/img'),
		gulp.dest('./www/img'),
		gulp.dest('./electron/img')
	))
	.on('end', done);
});

gulp.task('js', function(done) {
	try {
		gulp.src([
			'./src/js/lib/jquery/dist/jquery.min.js',
			'./src/js/util.js',
			'./src/js/custom/counter_flipper.js',
			'./src/js/lib/imagesloaded/imagesloaded.pkgd.min.js',
			'./src/js/lib/masonry/dist/masonry.pkgd.js',
			'./src/js/lib/swiper/dist/js/swiper.min.js',
			'./src/js/lib/isotope/dist/isotope.pkgd.min.js',
			'./src/js/lib/teljs/dist/scripts/tel.js',
			'./src/js/lib/teljs/data/metadatalite.js',
			'./src/js/lib/fancyBox/dist/jquery.fancybox.min.js',
			'./src/js/lib/angular-ui-router/release/angular-ui-router.min.js',
			'./src/js/lib/angular-animate/angular-animate.min.js',
			'./src/js/lib/select2/dist/js/select2.full.min.js',
			'./src/js/lib/javascript-load-image/js/load-image.all.min.js',
			'./src/js/app.js',
			'./src/js/directives.js',
			'./src/js/settings.js',
			'./src/js/controllers/*.js',
			'./src/js/config.js'
		])
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
		.pipe(multistream(
			gulp.dest('./web/js'),
			gulp.dest('./www/js'),
			gulp.dest('./electron/js')
		))
		.on('end', done);
		gulp.src('./src/js/lib/angular/angular.*', {base: './src/js/lib/angular/'})
		.pipe(multistream(
			gulp.dest('./web/js'),
			gulp.dest('./electron/js')
		));
		gulp.src(['./src/js/lib/ionic/**/*','./src/js/lib/ngCordova/dist/*.js'], {base: './src/js/lib/'})
		.pipe(gulp.dest('./www/lib/'));
		// gulp.src(['./src/js/lib/animate.css/animate.min.css'])
		// .pipe(multistream(
		// 	gulp.dest('./web/js/lib/animate.css/'),
		// 	gulp.dest('./electron/js/lib/animate.css/'),
		// 	gulp.dest('./www/js/lib/animate.css/')
		// ));
	} catch (e) {}
});

gulp.task('watch', function() {
	gulp.watch(['./src/views/**/**/*.jade'],['jade']);
	gulp.watch(['./src/scss/**/**/*.scss'], ['sass']);
	gulp.watch(['./src/js/**/**/*.js'],     ['js']);
	gulp.watch(['./src/img/*'],             ['images']);
});
