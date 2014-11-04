module.exports = function (grunt) {
    var config,
        path = require('path');

    require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

    config = {
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            script: {
                files: [
                    'core/template/back-end/assets/js/*.js'
                ],
                tasks: ['copy:js']
            },
            livereload: {
                files: [
                    'core/build/css/*.css',
                    'core/build/assets/js/*.js',
                    'core/template/back-end/*.jade',
                    'content/themes/serenader/css/*.css',
                    'content/themes/serenader/js/*.js',
                    'content/themes/serenader/*.jade'
                ],
                options: {
                    livereload: true
                }
            },
            sass: {
                files: [
                    'core/template/back-end/assets/css/*.scss',
                    'core/template/front-end/assets/css/*.scss'
                ],
                tasks: ['sass']
            },
            clientSide: {
                files: [
                    'core/template/front-end/**'
                ],
                tasks: ['copy:client']
            }
        },

        jshint: {
            backEnd: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: {
                    src: [
                        '*.js',
                        'core/*.js',

                    ]
                }
            }
        },

        sass: {
            compress: {
                options: {
                    style: 'compressed',
                    sourcemap: true
                },
                files: [
                    {
                        dest: 'core/build/css/sign.min.css',
                        src: 'core/template/back-end/assets/css/sign.scss'
                    },
                    {
                        dest: 'core/build/css/style.min.css',
                        src: 'core/template/back-end/assets/css/style.scss'
                    },
                    {
                        dest: 'core/template/front-end/assets/css/style.min.css',
                        src: 'core/template/front-end/assets/css/*.scss'
                    }
                ]
            }
        },

        concat: {
            libraries: {
                dest: 'core/build/js/vendor.js',
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/jquery-file-upload/js/vendor/jquery.ui.widget.js',
                    'bower_components/lodash/dist/lodash.js',
                    'bower_components/marked/lib/marked.js',
                    'bower_components/codemirror/lib/codemirror.js',
                    'bower_components/backbone/backbone.js',
                    'bower_components/jquery-file-upload/js/jquery.fileupload.js',
                    'bower_components/jquery-file-upload/js/jquery.iframe-transport.js',
                    'bower_components/blueimp-gallery/js/blueimp-gallery.min.js'
                ]
            }
        },

        uglify: {
            script: {
                options: {
                    sourceMap: true
                },
                files: {
                    'core/build/js/vendor.min.js': 'core/build/js/vendor.js'
                }
            }
        },

        shell: {
            bower: {
                command: path.resolve('node_modules/.bin/bower --allow-root install'),
                options: {
                    stdout: true,
                    stdin: true
                }
            }
        },

        copy: {
            ace: {
                src: ['**'],
                dest: 'core/build/ace/',
                cwd: 'bower_components/ace/',
                expand: true,
            },
            js: {
                files: [
                    {
                        src: ['**'],
                        dest: 'core/build/js/',
                        cwd: 'core/template/back-end/assets/js/',
                        expand: true,
                    },
                    {
                        cwd: 'bower_components/jquery/dist/',
                        src: 'jquery.js',
                        dest: 'core/build/js/',
                        expand: true,
                    },
                    {
                        cwd: 'bower_components/jquery/dist/',
                        src: 'jquery.js',
                        dest: 'content/themes/serenader/js/',
                        expand: true
                    }
                ]
            },
            css: {
                files: [
                    {
                        src: 'core/template/back-end/assets/css/common.css',
                        dest: 'core/build/css/common.css'
                    },
                    {
                        src: 'bower_components/fontawesome/css/font-awesome.min.css',
                        dest: 'core/build/css/font-awesome.min.css'
                    }
                ]
            },
            font: {
                cwd: 'bower_components/fontawesome/fonts/',
                src: '**',
                dest: 'core/build/fonts/',
                expand: true,
            },
            client: {
                files: [
                    {
                        expand: true,
                        cwd: 'core/template/front-end',
                        src: '**',
                        dest: 'content/themes/serenader/'
                    }
                ]
            },
            image: {
                src: ['**'],
                cwd: 'core/template/back-end/assets/img/',
                dest: 'core/build/img/',
                expand: true
            }
        },

        express: {
            options: {
                script: 'index.js',
                output: 'Serenader is running'
            },
            dev: {
                options: {
                    output: 'Running in dev',
                    delay: 1000
                }
            }
        }
    };


    grunt.initConfig(config);

    grunt.registerTask('test', 'Run tests and lint code', 
        ['jshint']);

    grunt.registerTask('init', 'Initialize the project', 
        ['shell:bower']);

    grunt.registerTask('prepare', 'Prepare the project', 
        ['concat:libraries', 'copy', 'sass:compress']);

    grunt.registerTask('build', 'Build the project for production', 
        ['prepare', 'uglify:script']);

    grunt.registerTask('dev', 'Running project in dev env', 
        ['express', 'watch']);
};