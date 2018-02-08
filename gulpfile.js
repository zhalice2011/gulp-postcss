var gulp = require('gulp');
var jshint = require('gulp-jshint'); // 引入检测js文件模块
var uglify = require('gulp-uglify'); // 引入js压缩模块
var concat = require('gulp-concat'); // 引入合并文件模块
var minhtml = require('gulp-minify-html'); // 引入html压缩模块
var minify = require('gulp-minify-css'); // 引入压缩css的模块
var imagemin = require('gulp-imagemin'); // 引入压缩图片插件
var postcss = require('gulp-postcss'); //JavaScript 代码来转换CSS 中的样式
var autoprefixer = require('autoprefixer'); //自动加上浏览器前缀
var postcsswritesvg = require('postcss-write-svg') // 解决1px方案

// 目前出视觉设计稿，我们都是使用750px宽度的，从上面的原理来看，那么100vw = 750px，即1vw = 7.5px
var pxtoviewport = require('postcss-px-to-viewport'); // 代码中写px编译后转化成vm

var browserSync = require('browser-sync')
var opn = require('opn')
//静态服务器

// 1.处理js文件
gulp.task('js', function () {
    return gulp.src('js/*.js')
        .pipe(jshint()) //检测js
        .pipe(uglify()) //压缩js
        .pipe(concat('index.js')) //合并js文件并命名为'index.js'
        .pipe(gulp.dest('build/js')); //将合并后的js文件输出到build文件夹下      
});

// 2.处理css
gulp.task('css', function () {
    var processors = [
        pxtoviewport({
            viewportWidth: 750,
            viewportHeight: 1334,
            unitPrecision: 5,
            viewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false
        })
    ];
    return gulp.src('css/*.css') // 指定css文件夹下的所有后缀为.css的文件
        .pipe(postcss([ autoprefixer() ]))  //自动加上浏览器前缀
        .pipe(postcss(processors))
        //.pipe(minify()) //使用minify模块进行css 压缩
        .pipe(gulp.dest('build/css')) // 最终将压缩的文件输出到minicss文件下            
})

// 3.压缩img
gulp.task('img', function () {
    gulp.src('images/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            progressive: true, //Boolean类型 默认:false 无损压缩图片
            optimizationLevel: 5, //number类型 默认:3 取值范围:0-7(优化等级)
            interlced: true, //Boolean类型 默认false 隔行扫描gif进行渲染
            multipass: true //Boolean类型 默认false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('build/images')) //输入到build文件夹下的images文件夹下 
})

// 4.压缩html
gulp.task('html', function () {
    gulp.src('*.html') //指定当前文件夹下的所有html文件
        .pipe(minhtml()) //进行压缩
        .pipe(gulp.dest('build')) //将压缩后的文件输出到build文件夹下
        .pipe(browserSync.stream()); //自动打开浏览器

})

// 定义path
var path = {
    css: './css/*.css',
    js: './js/*.js',
    html: './*.html',
    src: './build'    
};

// 命令行输入gulp或者 gulp default的时候就会执行
gulp.task('default', function(){
    //把任务串联起来
    gulp.start('js', 'css', 'img', 'html');

    //打开静态服务器
    browserSync.init({
        server:{
            baseDir: path.src
        },
        port:3000,
        open:false
    }, function(){
        var homepage = 'http://localhost:3000/';
        opn(homepage);
    });

    //监听文件的变化实时编译 然后刷新
    gulp.watch([path.html, path.js, path.css]).on("change", function() {
        gulp.start('js', 'css', 'img', 'html');        
        browserSync.reload();
    });
});