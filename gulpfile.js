"use strict";
var gulp = require('gulp'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    useref = require('gulp-useref'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    assetRev = require('gulp-asset-rev'),
    jshint = require("gulp-jshint"),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del = require('del');
    function gulpScripts(app_name) {
        return gulp.src([app_name + '/**/*.js']) //源文件下的所有js
            .pipe(assetRev())                    //配置版本号
            .pipe($.uglify())                    //进行压缩，如果需要合并也可加上合并的代码
            .pipe(gulp.dest(app_name + "_dist"));//复制到目标文件路径
    }

    function gulpStyles(app_name) {
        return gulp.src([app_name + '/**/*.css'])
            .pipe(assetRev())
            .pipe($.minifyCss())
            .pipe(gulp.dest(app_name + "_dist"));
    }

    function gulpImages(app_name) {
        return gulp.src([app_name + '/**/images/*'])
            .pipe(gulp.dest(app_name + "_dist"));   //复制所有图片到目标文件夹
    }

    function gulpRevHtml(app_name) {
        gulp.src([app_name + '/*.html', app_name + '/**/*.html'])   //源文件下面是所有html
            .pipe(assetRev())                                       //配置引用的js和css文件，需要的话也可以用minifyHtml压缩html文件
            .pipe(gulp.dest(app_name + '_dist'));                   //打包到目标文件夹路径下面
    }

    gulp.task('hello', function() {
        console.log('Hello Zenos!');
    });

    gulp.task('browserSync', function() {
        browserSync({
            server: {
                baseDir: 'app'
            }
        })
    });
    //监听css
    gulp.task('less', function() {
        return gulp.src('less/*.less')
            .pipe(less())
            .pipe(gulp.dest('app/css'))
            .pipe(browserSync.reload({
                stream: true
            }))
    });
    //监听html
    gulp.task('useref', function(){
        return gulp.src('app/*.html')
            .pipe(useref())
            .pipe(uglify())
            .pipe(gulp.dest('dist'));
    });
    //监听fonts
    gulp.task('fonts', function() {
        return gulp.src('app/fonts/**/*')
            .pipe(gulp.dest('dist/fonts'))
    });

    //压缩图片，压缩后的文件放入dist/images
    gulp.task('image',function(){
        gulp.src('app/images/*.+(jpg|png|gif|svg)')
            //压缩
            .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
            .pipe(gulp.dest('dist/images'));//输出
    });

    //检查代码
    gulp.task('jsLint', function () {
        gulp.src('app/js/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter()); // 输出检查结果
    });
    // 合并、压缩、重命名css
    gulp.task('stylesheets',['less'], function() {
        // 注意这里通过数组的方式写入两个地址,仔细看第一个地址是css目录下的全部css文件,第二个地址是css目录下的areaMap.css文件,但是它前面加了!,这个和.gitignore的写法类似,就是排除掉这个文件.
        gulp.src(['app/css/*.css','!.app/css/areaMap.css'])
            .pipe(concat('all.css'))
            .pipe(gulp.dest('app/css/'))
            .pipe(rename({ suffix: '.min' }))
            .pipe(minifycss())
            .pipe(gulp.dest('app/css'));
    });

    // 合并，压缩js文件
    gulp.task('javascripts', function() {
        gulp.src('app/js/*.js')
            .pipe(concat('all.js'))
            .pipe(gulp.dest('app/js'))
            .pipe(rename({ suffix: '.min' }))
            .pipe(uglify())
            .pipe(gulp.dest('app/js'));
    });

    //增加版本号
    gulp.task('rev',['revCss'],function() {
        gulp.src("app/views/*.html")
            .pipe(assetRev())
            .pipe(gulp.dest('dist'));
    });
    gulp.task('revCss',function () {
        return gulp.src('app/css/*.css')
            .pipe(assetRev())
            .pipe(gulp.dest('dist/styles/'))
    });

    // 清空图片、样式、js
    gulp.task('clean', function() {
        return gulp.src(['app/css/all.css','app/css/all.min.css'], {read: false})
            .pipe(clean({force: true}));
    });
    gulp.task('develop',function(){
        gulp.run('less','javascripts','stylesheets');
        gulp.watch('less/*.less', ['less']);
    });

    gulp.task('prod',function(){
        gulp.run('less','stylesheets','useref','fonts','javascripts','watch');
    });
    gulp.task('build', function (callback) {
        runSequence('clean:dist',
            ['less', 'useref', 'images', 'fonts'],
            callback
        )
    });

    gulp.task('default',['clean'], function() {
        gulp.run('develop');
    });

    //自动刷新
    gulp.task('watch', ['browserSync', 'less'], function (){
        gulp.watch('less/*.less', ['less']);
        gulp.watch('app/views/*.html', browserSync.reload);
        gulp.watch('app/js/**/*.js', browserSync.reload);

    });

    gulp.task('default',['rev']);
    gulp.task('default', function (callback) {
        runSequence(['less','browserSync', 'watch'],
            callback
        )
    });

    gulp.task('clean', function(callback) {
        del('dist');
        return cache.clearAll(callback);
    });
