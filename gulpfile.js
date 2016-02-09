//////////////////////////////////////////////////
//
// Настройка переменных
// Задаём paths
//
/////////////////////////////////////////////////
var path = {
	public: { //Готовая сборка
		root: 'public/',
		js: 'public/js/',
		style: 'public/style/',
		img: 'public/'
	},
	app:{ //Рабочие файлы
		dir: 'app/dir/**/',
		html: 'app/*.html',
		js: 'app/js/main.js',
		style: 'app/style/main.scss',
		img: ['app/**/*.{png,jpg,jpeg,gif,svg}', '!app/dir/**/*.*']
	},
	watch:{//Файлы слежения
		dir: 'app/dir/**/*',

		///
		html: ['app/**/*.html', '!app/template/**/*.html'],
		template: 'app/template/**/*.html',
		///

		// html: 'app/**/*.html',
		js: 'app/js/**/*.js',
		style: 'app/style/**/*.scss',
		img: ['app/**/*.{png,jpg,jpeg,gif,svg}', '!app/dir/**/*.*']
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
		cssnano = require('gulp-cssnano'), // Сжатие css файлов
		uglify = require('gulp-uglify'), // Сжатие js файлов
		htmlmin = require('gulp-htmlmin'), // Сжатие Html
		rename = require('gulp-rename'), // Переменование
		plumber = require('gulp-plumber'), // Ловим ошибки и перезапускае watch
		autoprefixer = require('gulp-autoprefixer'), // Добавление префиксов
		imagemin = require('gulp-imagemin'), //Сжатие картинок
		imageminPngquant = require('imagemin-pngquant'), //Сжатие .png
		notify = require("gulp-notify"), // Сообщения
		clean = require('gulp-clean'),
		changed = require('gulp-changed'), // Кеширование файлов, tack работают только для изменившихся фалов
		runSequence = require('run-sequence'), // Асинхронный запуск задач
		rigger = require('gulp-rigger'); //Импорт файлов //= template/файл.html


//////////////////////////////////////////////////
//
// Задачи для Scss
//
/////////////////////////////////////////////////
gulp.task('style', function () {
	return gulp.src(path.app.style)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sass())
		.pipe(rename({suffix: '.min'}))
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
		.pipe(rename({suffix: '.min'}))
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
	.pipe(rigger())
	.pipe(changed(path.public.root))
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	.pipe(gulp.dest(path.public.root))
	.pipe(browserSync.stream());
});

////
gulp.task('template', function() {
	return gulp.src(path.app.html)
	.pipe(rigger())
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	.pipe(gulp.dest(path.public.root));
});
////

//////////////////////////////////////////////////
//
// Задачи для Img
//
/////////////////////////////////////////////////
gulp.task('img', function() {
	return gulp.src(path.app.img)
		.pipe(changed(path.public.img))
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
gulp.task('copy-dir', function() {
	return gulp.src(path.app.dir)
		.pipe(changed(path.public.root))
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(gulp.dest(path.public.root))
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

///
		gulp.watch(path.watch.template, ['template']);
///

		gulp.watch(path.watch.style, ['style']);
		gulp.watch(path.watch.js, ['js']);
		gulp.watch(path.watch.img, ['img']);
		gulp.watch(path.watch.dir, ['copy-dir']);
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
gulp.task('default',function(callback) {
  runSequence(['html', 'style', 'js', 'img', 'copy-dir'],
              'watch', 'server',
              callback);
});




//////////////////////////////////////////////////
//
// Итоговая сборка проекта
//
/////////////////////////////////////////////////
gulp.task('build', function(callback) {
  runSequence('build-clean',
              ['build-html', 'build-style', 'build-js', 'img', 'copy-dir'],
              'watch', 'server',
              callback);
});

gulp.task('build-clean', function() {
	return gulp.src(path.public.root)
		.pipe(clean({force: true}));
});

gulp.task('build-style', function () {
	return gulp.src(path.app.style)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sass())
		.pipe(autoprefixer({ browsers: ['last 3 versions'], cascade: false } ))
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.public.style))
		.pipe(browserSync.stream());
});

gulp.task('build-js', function() {
	return gulp.src(path.app.js)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(rigger())
		.pipe(uglify({compress: true, mangle: true}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.public.js))
		.pipe(browserSync.stream());
});

gulp.task('build-html', function() {
	return gulp.src(path.app.html)
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	.pipe(rigger())
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest(path.public.root))
	.pipe(browserSync.stream());
});





//////////////////////////////////////////////////
//
// Запускаем сервер со слежением файлов, без копирования файлов
//
/////////////////////////////////////////////////
gulp.task('edit', ['server', 'watch']);