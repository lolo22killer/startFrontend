//////////////////////////////////////////////////
//
// Настройка переменных
// Задаём paths
//
/////////////////////////////////////////////////
var path = {
	public: { //Готовая сборка
		dir: 'public/',
		js: 'public/js/',
		vendorJs: 'public/js/vendor/',
		style: 'public/style/',
		vendorCss: 'public/style/vendor/',
		img: 'public/img/',
		fonts: 'public/fonts/'
	},
	app:{ //Рабочие файлы
		dir: 'app/',
		html: 'app/*.html',
		js: 'app/js/main.js',
		vendorJs: 'app/js/vendor/script.js',
		style: 'app/style/main.scss',
		vendorCss: 'app/style/vendor/style.css',
		img: 'app/img/**/*.*',
		fonts: 'app/fonts/**/*.*',
		ico: ['app/favicon.ico', 'app/*.png']
	},
	watch:{//Файлы слежения
		dir: 'app/',
		html: 'app/**/*.html',
		js: ['app/js/main.js', 'app/js/partials/*.js'],
		vendorJs: 'app/js/vendor/*.js',
		style: 'app/style/**/*.scss',
		vendorCss: 'app/style/vendor/*.css',
		img: 'app/img/**/*.*',
		fonts: 'app/fonts/**/*.*',
		ico: ['app/favicon.ico', 'app/*.png']
	},
	server:{//Сервер
		proxyUrl: 'http://lending.ru',
		local: './public/'
	}
};

//////////////////////////////////////////////////
//
// Включаем задачи
//
/////////////////////////////////////////////////
var gulp = require('gulp'),
		sass = require('gulp-sass'),
		browserSync = require('browser-sync').create(),
		cssmin = require('gulp-cssmin'), // Сжатие css файлов
		uglify = require('gulp-uglify'), // Сжатие js файлов
		htmlmin = require('gulp-htmlmin'), // Сжатие Html
		rename = require('gulp-rename'), // Переменование
		plumber = require('gulp-plumber'), // Ловим ошибки и перезапускае watch
		autoprefixer = require('gulp-autoprefixer'), // Добавление префиксов
		imagemin = require('gulp-imagemin'), //Сжатие картинок
		imageminPngquant = require('imagemin-pngquant'), //Сжатие .png
		notify = require("gulp-notify"), // Сообщения
		sourcemaps = require('gulp-sourcemaps'),
		rigger = require('gulp-rigger'); //Импорт файлов //= template/файл.html


//////////////////////////////////////////////////
//
// Задачи для Sass
//
/////////////////////////////////////////////////
gulp.task('style', function () {
	return gulp.src(path.app.style)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		// .pipe(sourcemaps.init())
		.pipe(sass())
		// .pipe(uncss({   // Убираем лишние стили
		// 				html: [path.app.html]
		// 		}))
		.pipe(autoprefixer({ browsers: ['last 3 versions'], cascade: false } ))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest(path.public.style))
		.pipe(browserSync.stream());
});

//////////////////////////////////////////////////
//
// Задачи для Js
//
/////////////////////////////////////////////////
gulp.task('js', function() {
	return gulp.src(path.app.js)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(rigger())
		// .pipe(sourcemaps.init())
		.pipe(uglify({compress: true, mangle: true}))
		.pipe(rename({suffix: '.min'}))
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest(path.public.js))
		.pipe(browserSync.stream());
});

//////////////////////////////////////////////////
//
// Задачи для HTML
//
/////////////////////////////////////////////////
gulp.task('html', function() {
	return gulp.src(path.app.html)
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	.pipe(rigger())
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest(path.public.dir))
	.pipe(browserSync.stream());
});

//////////////////////////////////////////////////
//
// Задачи для Img
//
/////////////////////////////////////////////////
gulp.task('img', function() {
	return gulp.src(path.app.img)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [imageminPngquant()],
			interlaced: true
		}))
	.pipe(gulp.dest(path.public.img));
});

//////////////////////////////////////////////////
//
// Задачи для переноса остальных файлов
//
/////////////////////////////////////////////////
gulp.task('copy', [ 'fonts', 'vendorCss', 'vendorJs', 'ico' ]);

gulp.task('fonts', function() {
	return gulp.src(path.app.fonts)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(gulp.dest(path.public.fonts))
		.pipe(browserSync.stream());
});
gulp.task('vendorCss', function() {
	return gulp.src(path.app.vendorCss)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(rigger())
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.public.vendorCss))
		.pipe(browserSync.stream());
});
gulp.task('vendorJs', function() {
	return gulp.src(path.app.vendorJs)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(rigger())
		.pipe(uglify({compress: true, mangle: true}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.public.vendorJs))
		.pipe(browserSync.stream());
});
gulp.task('ico', function() {
	return gulp.src(path.app.ico)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(gulp.dest(path.public.dir))
		.pipe(browserSync.stream());
});


//////////////////////////////////////////////////
//
// Задача watch
// Отслеживает любые изменения в файлах CSS, JS и HTML
//
/////////////////////////////////////////////////
gulp.task ('watch', function() {
		gulp.watch(path.watch.html, ['html']);
		gulp.watch(path.watch.style, ['style']);
		gulp.watch(path.watch.js, ['js']);
		gulp.watch(path.watch.img, ['img']);
		gulp.watch(path.watch.ico, ['ico']);
		gulp.watch(path.watch.fonts, ['fonts']);
		gulp.watch(path.watch.vendorCss, ['vendorCss']);
		gulp.watch(path.watch.vendorJs, ['vendorJs']);
});

// ///////////////////////////////////////////////
//
// Задачи Browser-Sync
//
/////////////////////////////////////////////////
gulp.task('server', function() {
		browserSync.init({
				// proxy: path.server.proxyUrl  //Прохси сервер
				server: {
            baseDir: path.server.local    //Локальный сервер
        }
		});
});

//////////////////////////////////////////////////
//
// Задача по умолчанию
//
/////////////////////////////////////////////////
gulp.task('default', ['html', 'style', 'js', 'img', 'copy', 'watch', 'server']);


//////////////////////////////////////////////////
//
// Запускаем сервер со слежением файлов, без копирования файлов
//
/////////////////////////////////////////////////
gulp.task('edit', ['watch'], function() {
	browserSync.init({
				// proxy: path.server.proxyUrl  //Прохси сервер
				server: {
            baseDir: path.server.local    //Локальный сервер
        }
		});
});