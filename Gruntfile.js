module.exports = function (grunt) {

    function testPlugin(param) {
        param = param || 'nope';

        return function (style) {
            style.define('test-plugin', param);
        };
    }

    // LiveReload的默认端口号，你也可以改成你想要的端口号
    var lrPort = 9547;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:9527/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({port: lrPort});
    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var lrMiddleware = function (connect, options) {
        return [
            lrSnippet,
            // 静态文件服务器的路径 原先写法：connect.static(options.base[0])
            serveStatic(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览) 原先写法：connect.directory(options.base[0])
            serveIndex(options.base[0])
        ];
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        connect: {
            options: {
                // 服务器端口号
                port: 8011,
                // 服务器地址(可以使用主机名localhost，也能使用IP)
                hostname: 'localhost',
                // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                base: '.'
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                }
            }
        },
        watch: {
            another: {
                files: ['css/*', 'src/*.styl'],
                tasks: ['stylus'],
                options: {
                    livereload: 1437
                }
            },
            client: {
                // 我们不需要配置额外的任务，watch任务已经内建LiveReload浏览器刷新的代码片段。
                options: {
                    livereload: lrPort
                },
                // '**' 表示包含所有的子目录
                // '*' 表示包含所有的文件
                files: ['*.html', 'css/*', 'scss/*', 'js/*', 'images/**/*']
            }
        }, // grunt.initConfig配置完毕
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },
            uses_defaults: ['dir1/**/*.js', 'dir2/**/*.js'],
            with_overrides: {
                options: {
                    curly: false,
                    undef: true
                },
                files: {
                    src: ['dir3/**/*.js', 'dir4/**/*.js']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        stylus: {
            compile: {
                options: {
                    paths: ['css'],
                    relativeDest: '../css',     // 编译后输出的位置
                                                //path to be joined and resolved with each file dest to get new one. 要加入和解决与每个文件 dest 去找新的路径。
                                                //mostly useful for files specified using wildcards 主要用于使用通配符指定的文件
                    urlfunc: 'data-uri',        // use data-uri('test.png') in our code to trigger Data URI embedding 在我们的代码中使用 data-uri('test.png') 来触发数据 URI 嵌入
                    use: [
                        testPlugin,
                        function () {
                            return testPlugin('yep');
                        }
                    ]
                },
                files: {
                    'css/base-all.css': 'css/base-all.styl', // 1:1 compile
                    'css/main.css': 'css/main.styl',
                    'css/public.css': 'css/public.styl'
                    //'path/to/another.css': ['path/to/sources/*.styl', 'path/to/more/*.styl']
                    // compile and concat into single file 编译和连接到单个文件
                }
            }
        }
    });

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // 默认被执行的任务列表。
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('live', ['connect', 'watch']);

};