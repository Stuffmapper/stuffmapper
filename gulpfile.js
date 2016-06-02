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
var sh = require('shelljs');

var paths = {
	sass: ['./scss/**/*.scss'],
	jade: ['./scss/**/*.jade']
};

gulp.task('default', ['sass', 'jade', 'js', 'images']);

gulp.task('sass', function(done) {
	gulp.src('./scss/**/**/*.app.scss')
	.pipe(sass())
	.on('error', sass.logError)
	.pipe(gulp.dest('./www/css/'))
	.pipe(minifyCss({
		keepSpecialComments: 0
	}))
	.pipe(rename({ extname: '.min.css' }))
	.pipe(multistream(
		gulp.dest('./projects/web/css/'),
		gulp.dest('./projects/ionic/css/'),
		gulp.dest('./projects/electron/css/')
	))
	.on('end', done);
	gulp.src('./js/lib/font-awesome/css/*', {base: './js/lib/font-awesome/css/'})
	.pipe(multistream(
		gulp.dest('./projects/web/css'),
		gulp.dest('./projects/ionic/css'),
		gulp.dest('./projects/electron/css')
	));
	gulp.src('./js/lib/font-awesome/fonts/*', {base: './js/lib/font-awesome/fonts/'})
	.pipe(multistream(
		gulp.dest('./projects/web/fonts'),
		gulp.dest('./projects/ionic/fonts'),
		gulp.dest('./projects/electron/fonts')
	));
});
gulp.task('jade', function(done) {
	gulp.src('./views/index.jade')
	.pipe(jade({
		locals : {
			ionic: true,
			dev: true
		},
		pretty : true,
		doctype: 'html'
	}))
	.pipe(gulp.dest('./projects/ionic/'))
	.on('end', done);

	gulp.src('./views/index.jade')
	.pipe(jade({
		locals : {
			electron: true,
			dev: true
		},
		pretty : true,
		doctype: 'html'
	}))
	.pipe(gulp.dest('./projects/electron/'));

	gulp.src('./views/index.jade')
	.pipe(jade({
		locals : {
			dev: true
		},
		pretty : true,
		doctype: 'html'
	}))
	.pipe(gulp.dest('./projects/web/'));
});

gulp.task('images', function(){
	gulp.src('./img/**/*', {base: './img/'})
	.pipe(multistream(
		gulp.dest('./projects/web/img'),
		gulp.dest('./projects/ionic/img'),
		gulp.dest('./projects/electron/img')
	));
});

gulp.task('js', function(done) {
	gulp.src([
		'./js/lib/jquery/dist/jquery.min.js',
		'./js/lib/counter_flipper.js',
		'./js/lib/imagesloaded/imagesloaded.pkgd.min.js',
		'./js/lib/masonry/dist/masonry.pkgd.js',
		'./js/lib/angular-ui-router/release/angular-ui-router.min.js',
		'./js/lib/angular-animate/angular-animate.min.js',
		'./js/controllers/*.js',
		'./js/app.js'
	])
	.pipe(sourcemaps.init())
	.pipe(concat('all.js'))
	.pipe(sourcemaps.write())
	.pipe(multistream(
		gulp.dest('./projects/web/js'),
		gulp.dest('./projects/ionic/js'),
		gulp.dest('./projects/electron/js')
	))
	.pipe(rename('all.min.js'))
	.pipe(uglify({
		mangle: false
	}))
	.pipe(multistream(
		gulp.dest('./projects/web/js'),
		gulp.dest('./projects/ionic/js'),
		gulp.dest('./projects/electron/js')
	))
	.on('end', done);
	gulp.src('./js/lib/angular/angular.*', {base: './js/lib/angular/'})
	.pipe(multistream(
		gulp.dest('./projects/web/js'),
		gulp.dest('./projects/electron/js')
	));
	gulp.src(['./js/lib/ionic/**/*','./js/lib/ngCordova/dist/*.js'], {base: './js/lib/'})
	.pipe(gulp.dest('./projects/ionic/lib/'));
});

gulp.task('build', function() {
});

gulp.task('watch', function() {
	gulp.watch(['./views/**/**/*.jade'],['jade']);
	gulp.watch(['./scss/**/**/*.scss'], ['sass']);
	gulp.watch(['./js/**/**/*.js'],     ['js']);
	gulp.watch(['./img/*'],             ['images']);
});

gulp.task('install', ['git-check'], function() {
	return bower.commands.install()
	.on('log', function(data) {
		gutil.log('bower', gutil.colors.cyan(data.id), data.message);
	});
});

gulp.task('git-check', function(done) {
	if (!sh.which('git')) {
		console.log(
			'  ' + gutil.colors.red('Git is not installed.'),
			'\n  Git, the version control system, is required to download Ionic.',
			'\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
			'\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
		);
		process.exit(1);
	}
	done();
});
