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
		style: 'public/style/',
		img: 'public/img/',
		fonts: 'public/fonts/'
	},
	app:{ //Рабочие файлы
		dir: 'app/',
		html: 'app/*.html',
		js: 'app/js/main.js',
		scss: 'app/scss/main.scss',
		img: 'app/img/**/*.*',
		fonts: 'app/fonts/**/*.*',
		ico: ['app/favicon.ico', 'app/*.png']
	},
	watch:{//Файлы слежения
		dir: 'app/',
		html: ['app/**/*.html', '!app/template/**/*.html'],
		template: 'app/template/**/*.html',
		html: 'app/**/*.html',
		js: 'app/js/**/*.js',
		scss: 'app/scss/**/*.scss',
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
		minifyCss = require('gulp-minify-css'), // Сжатие css файлов
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
	return gulp.src(path.app.scss)
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
	.pipe(changed(path.public.dir))
	.pipe(rigger())
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	.pipe(gulp.dest(path.public.dir))
	.pipe(browserSync.stream());
});
gulp.task('template', function() {
	return gulp.src(path.app.html)
	.pipe(rigger())
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
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
gulp.task('copy', [ 'fonts', 'ico' ]);

gulp.task('fonts', function() {
	return gulp.src(path.app.fonts)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(gulp.dest(path.public.fonts))
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
		gulp.watch(path.watch.template, ['template']);

		gulp.watch(path.watch.scss, ['style']);
		gulp.watch(path.watch.js, ['js']);
		gulp.watch(path.watch.img, ['img']);
		gulp.watch(path.watch.ico, ['ico']);
		gulp.watch(path.watch.fonts, ['fonts']);
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
// Итоговая сборка проекта
//
/////////////////////////////////////////////////
gulp.task('build', function(callback) {
  runSequence('build-clean',
              ['build-html', 'build-style', 'build-js', 'img', 'copy'],
              'watch', 'server',
              callback);
});

gulp.task('build-clean', function() {
	return gulp.src(path.public.dir)
		.pipe(clean({force: true}));
});

gulp.task('build-style', function () {
	return gulp.src(path.app.scss)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sass())
		.pipe(autoprefixer({ browsers: ['last 3 versions'], cascade: false } ))
		.pipe(minifyCss())
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
	.pipe(gulp.dest(path.public.dir))
	.pipe(browserSync.stream());
});





//////////////////////////////////////////////////
//
// Запускаем сервер со слежением файлов, без копирования файлов
//
/////////////////////////////////////////////////
gulp.task('edit', ['server', 'watch']);