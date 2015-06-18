module.exports = function (grunt) {
    var config,
        path = require('path'),
        _ = require('lodash'),
        dashboardLibs,
        dashboardScripts,
        bowerDir,
        sassFile,
        dashboardLibsFile,
        dashboardLibsMinifiedFile,
        dashboardScriptsFile,
        dashboardScriptsMinifiedFile;

    // 后台面板的所有依赖库
    dashboardLibs = [
        'libs/jquery/dist/jquery.js',
        'libs/lodash/lodash.js',
        'libs/angular/angular.js',
        'libs/angular-animate/angular-animate.js',
        'libs/angular-messages/angular-messages.js',
        'libs/angular-resource/angular-resource.js',
        'libs/angular-route/angular-route.js',
        'libs/angular-sanitize/angular-sanitize.js',
        'libs/moment/moment.js',
        'libs/marked/lib/marked.js',
        'libs/angular-file-upload/angular-file-upload.js',
        'libs/blueimp-gallery/js/blueimp-gallery.js',
        'js/highlight.pack.js'
    ];

    // 后台面板的主要脚本
    dashboardScripts = [
        'app/app.js',
        'app/file.js',
        'app/gallery.js',
        'app/post.js',
        'app/setting.js',
        'app/setup.js',
        'app/sign.js',
        'app/directive/progress.js',
        'app/directive/msg-box.js',
        'app/directive/selector.js',
        'app/directive/dialog.js',
        'app/directive/img-thumb.js',
        'app/directive/ripple.js',
        'app/directive/upload.js',
        'app/directive/input.js',
        'app/service/dashboard.js',
    ];

    // bower下载下来的文件的路径
    bowerDir = grunt.file.readJSON('.bowerrc').directory;

    // sass 文件的路径
    sassFile = [
        {
            src: 'core/view/assets/scss/style.scss',
            dest: 'core/view/assets/css/style.css'
        },
        {
            src: 'core/view/assets/scss/sign.scss',
            dest: 'core/view/assets/css/sign.css'
        },
        {
            src: 'core/view/assets/scss/markdown-html.scss',
            dest: 'core/view/assets/css/markdown-html.css'
        }
    ];

    // 后台管理页面的所有库的合并和压缩后的路径
    dashboardLibsFile = 'core/view/assets/js/vendor/dashboard_libs.js';
    dashboardLibsMinifiedFile = 'core/view/assets/js/vendor/dashboard_libs.min.js';

    // 后台管理页面的主要脚本合并和压缩后的路径
    dashboardScriptsFile = 'core/view/assets/js/build/dashboard.js';
    dashboardScriptsMinifiedFile = 'core/view/assets/js/build/dashboard.min.js';

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
                    'core/view/assets/app/**/*',
                    'core/view/assets/views/*.html',
                    'core/view/assets/css/style.css',
                    'core/view/assets/css/sign.css',
                    'core/view/build/*'
                ]
            },
            sass: {
                files: ['core/view/assets/scss/*.scss'],
                tasks: ['css']
            },
            jade: {
                files: ['core/view/assets/jade/*.jade', 'core/view/assets/app/**/*.jade'],
                tasks: ['jade']
            },
            libs: {
                files: ['Gruntfile.js'],
                tasks: ['replace:dashboardDev']
            }
        },

        copy: {
            // ACE编辑器
            ace: {
                cwd: bowerDir + 'ace-builds/',
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
            dashboard: {
                files: [{
                    src: dashboardLibsFile,
                    dest: dashboardLibsMinifiedFile
                },{
                    src: dashboardScriptsFile,
                    dest: dashboardScriptsMinifiedFile
                }]
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
                        expand: true,
                        flatten: true,
                        src: 'core/view/assets/jade/*.jade',
                        dest: 'core/view/assets/app/template',
                        ext: '.html'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: 'core/view/assets/app/**/*.jade',
                        dest: 'core/view/assets/app/template/',
                        ext: '.html'
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
            dashboardDev: {
                // 生成开发模式下的后台管理页面脚本引入文件
                options: {
                    patterns: [{
                        match: 'dashboardDeps',
                        replacement: function () {
                            var scriptString = '';
                            _.forEach(dashboardLibs ,function (str) {
                                scriptString = scriptString
                                    + 'script(src="#{assets.server}/'
                                    + str
                                    + '", type="text/javascript")'
                                    + '\n';
                            });
                            return scriptString;
                        },
                    },{
                        match: 'dashboardUserScripts',
                        replacement: function () {
                            var scriptString = '';
                            _.forEach(dashboardScripts, function (str) {
                                scriptString = scriptString
                                    + 'script(src="#{assets.server}/'
                                    + str
                                    + '", type="text/javascript")'
                                    + '\n';
                            });
                            return scriptString;
                        }
                    }]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: 'dashboard_scripts.jade',
                        dest: 'core/view/build/',
                        cwd: 'core/view/scripts_tmpl/'
                    }
                ]
            },
            dashboardProd: {
                // 生成生产环境下的后台管理页面脚本引入文件
                options: {
                    patterns: [{
                        match: 'dashboardDeps',
                        replacement: function () {
                            return 'script(src="#{assets.server}/'
                                + dashboardLibsMinifiedFile.split('core/view/assets/')[1]
                                + '", type="text/javascript")';
                        }
                    },{
                        match: 'dashboardUserScripts',
                        replacement: function () {
                            return 'script(src="#{assets.server}/'
                                + dashboardScriptsMinifiedFile.split('core/view/assets/')[1]
                                + '", type="text/javascript")';
                        }
                    }]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: 'dashboard_scripts.jade',
                        dest: 'core/view/build/',
                        cwd: 'core/view/scripts_tmpl/'
                    }
                ]
            }
        },

        concat: {
            dashboardLibs: {
                dest: dashboardLibsFile,
                src: (function () {
                    var arr = [];
                    _.forEach(dashboardLibs, function (str) {
                        arr.push('core/view/assets/' + str);
                    });
                    return arr;
                })()
            },
            dashboardUserScripts: {
                dest: dashboardScriptsFile,
                src: (function () {
                    var arr = [];
                    _.forEach(dashboardScripts, function (str) {
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

        clean: [bowerDir, dashboardLibsFile, dashboardScriptsFile]
    };

    grunt.initConfig(config);

    // 初始化整个项目，下载bower依赖，以及前台主题，复制和编译各种必须的css和html文件
    grunt.registerTask('init', 'Download and copy the dependencies.',
        ['shell:bower', 'update_submodules', 'copy']);

    // 开发模式下的css任务
    grunt.registerTask('css', 'Building css file.',
        ['sass:compile', 'autoprefixer']);

    // 生产模式下的css任务
    // sass compress 有个bug,暂时不使用。
    grunt.registerTask('prod-css', 'Building production env css.',
        ['sass:compress', 'autoprefixer']);

    // 生成生产环境下的所有必须文件，并且清理不需要的文件。
    grunt.registerTask('prod-env', 'Building production env',
        ['css', 'jade', 'concat', 'uglify', 'replace:dashboardProd']);

    // 生成开发环境下的文件，并且启动服务器。
    grunt.registerTask('dev-env', 'Building dev env, and start the server.',
        ['css', 'jade', 'replace:dashboardDev']);

    grunt.registerTask('serve', 'Run the server under dev env',
        ['dev-env', 'express', 'watch']);
};