module.exports = function (grunt) {
    var config,
        path = require('path'),
        dependencies,
        bowerDir,
        sassFile,
        libsFile;

    // 前端依赖文件的路径
    dependencies = [
        'libs/jquery/dist/jquery.js',
        'libs/lodash/dist/lodash.js',
        'libs/angular/angular.js',
        'libs/angular-animate/angular-animate.js',
        'libs/angular-messages/angular-messages.js',
        'libs/angular-resource/angular-resource.js',
        'libs/angular-route/angular-route.js',
        'libs/angular-sanitize/angular-sanitize.js',
        'libs/moment/moment.js',
        'libs/marked/lib/marked.js',
        'libs/jquery-file-upload/js/vendor/jquery.ui.widget.js',
        'libs/jquery-file-upload/js/jquery.fileupload.js',
        'libs/blueimp-gallery/js/blueimp-gallery.js'
    ];

    // bower下载下来的文件的路径
    bowerDir = grunt.file.readJSON('.bowerrc').directory;

    // sass 文件的路径
    sassFile = [
        {
            src: 'core/view/assets/css/style.scss',
            dest: 'core/view/assets/css/style.css'
        },
        {
            src: 'core/view/assets/css/sign.scss',
            dest: 'core/view/assets/css/sign.css'
        },
        {
            src: 'core/view/assets/css/markdown-html.scss',
            dest: 'core/view/assets/css/markdown-html.css'
        }
    ];

    // 合并和压缩后的库的文件路径
    libsFile = 'core/view/assets/js/vendor/base.js';

    // 载入各种插件
    require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);
    require('time-grunt')(grunt);

    config = {
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    'core/view/*',
                    '!' + bowerDir + '*',
                    'core/view/assets/js/*',
                    'core/view/assets/views/*.html',
                    'core/view/assets/css/style.css',
                    'core/view/assets/css/sign.css'
                ]
            },
            sass: {
                files: ['core/view/assets/css/*.scss'],
                tasks: ['css']
            },
            jade: {
                files: ['core/view/assets/views/*.jade'],
                tasks: ['jade']
            }
        },

        copy: {
            // ACE编辑器
            ace: {
                cwd: bowerDir + 'ace/',
                src: ['**'],
                dest: 'core/view/assets/ace/',
                expand: true
            },
            // Fonts icon文件
            font: {
                files: [
                    {
                        cwd: bowerDir + 'material-design-icon/fonts/',
                        src: ['**'],
                        dest: 'core/view/assets/fonts/',
                        expand: true
                    },
                    {
                        cwd: bowerDir + 'material-design-icon/css/',
                        src: 'md-icon.min.css',
                        dest: 'core/view/assets/css/',
                        expand: true
                    }
                ]
            },
            // 一些库的CSS文件
            css: {
                files: [
                    {
                        cwd: bowerDir + 'blueimp-gallery/css/',
                        src: 'blueimp-gallery.min.css',
                        dest: 'core/view/assets/css/',
                        expand: true
                    },
                    {
                        cwd: bowerDir + 'blueimp-gallery/img/',
                        src: ['**'],
                        dest: 'core/view/assets/img/',
                        expand: true
                    }
                ]
            }
        },

        shell: {
            // 执行bower下载命令
            bower: {
                command: path.resolve('node_modules/.bin/bower --allow-root install'),
                options: {
                    stdout: true,
                    stdin: true
                }
            }
        },

        uglify: {
            // 压缩库文件
            default: {
                files: {
                    libsFile: libsFile,
                }
            }
        },

        sass: {
            compile: {
                // 编译sass代码。不压缩css代码
                options: {
                    outputStyle: 'nested'
                },
                files: sassFile
            },
            compress: {
                // 编译sass代码，压缩生成的代码
                options: {
                    outputStyle: 'compressed'
                },
                files: sassFile
            }
        },

        jade: {
            // 将前端的一些模板文件编译成html文件。（为了编码方便前端模板先使用jade写，再编译成html）
            compile: {
                options: {
                    data: {
                        debug: false
                    }
                },
                files: [
                    {
                        src: 'core/view/assets/views/*.jade',
                        dest: 'core/view/assets/views/'
                    }
                ]
            }
        },

        autoprefixer: {
            // 自动添加css前缀
            default: {
                files: [
                    {
                        src: 'core/view/assets/css/style.css',
                        dest: 'core/view/assets/css/style.css'
                    },
                    {
                        src: 'core/view/assets/css/sign.css',
                        dest: 'core/view/assets/css/sign.css'
                    }
                ]
            }
        },

        replace: {
            dev: {
                // 生成开发模式下的脚本引入文件
                options: {
                    patterns: [{
                        match: 'script',
                        replacement: function () {
                            var scriptString = '';
                            dependencies.forEach(function (str) {
                                scriptString = scriptString
                                    + '\n'
                                    + 'script(src="#{assets.server}/'
                                    + str
                                    + '", type="text/javascript")';
                            });
                            return scriptString;
                        },
                    }]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: 'dependencies.jade',
                        dest: 'core/view/build/',
                        cwd: 'core/view/'
                    }
                ]
            },
            prod: {
                // 生成生产环境下的脚本引入文件
                options: {
                    patterns: [{
                        match: 'script',
                        replacement: function () {
                            return 'script(src="#{assets.server}/'
                                + libsFile.split('core/view/assets/')[1]
                                + '", type="text/javascript")';
                        }
                    }]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: 'dependencies.jade',
                        dest: 'core/view/build/',
                        cwd: 'core/view/'
                    }
                ]
            }
        },

        concat: {
            // 合并所有依赖库到一个文件里面
            libs: {
                dest: libsFile,
                src: (function () {
                    var arr = [];
                    dependencies.forEach(function (str) {
                        arr.push('core/view/assets/' + str);
                    });
                    return arr;
                })()
            }
        },

        update_submodules: {
            // 下载和更新前台默认主题
            default: {
                options: {}
            }
        },

        express: {
            // 运行整个server
            options: {
                script: 'index.js',
                output: 'Project is running'
            },
            dev: {
                options: {
                    delay: 1
                }
            }
        },

        clean: [bowerDir]
    };

    grunt.initConfig(config);

    // 初始化整个项目，下载bower依赖，以及前台主题，复制和编译各种必须的css和html文件
    grunt.registerTask('init', 'Download and copy the dependencies.',
        ['shell:bower', 'update_submodules', 'copy', 'jade']);

    // 开发模式下的css任务
    grunt.registerTask('css', 'Building css file.',
        ['sass:compile', 'autoprefixer']);

    // 生产模式下的css任务
    grunt.registerTask('prod-css', 'Building production env css.',
        ['sass:compress', 'autoprefixer']);

    // 生成生产环境下的所有必须文件，并且清理不需要的文件。
    grunt.registerTask('prod', 'Building production env',
        ['prod-css', 'concat', 'uglify', 'replace:prod', 'clean']);

    // 生成开发环境下的文件，并且启动服务器。
    grunt.registerTask('dev', 'Building dev env, and start the server.',
        ['css', 'replace:dev', 'express', 'watch']);
};