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
                tasks: ['concat']
            },
            livereload: {
                files: [
                    'core/build/css/*.css',
                    'core/build/assets/js/*.js',
                    'content/themes/serenader/css/*.css',
                    'content/themes/serenader/js/*.js'
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
                        dest: 'content/themes/serenader/css/style.min.css',
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
                    'bower_components/lodash/dist/lodash.js',
                    'bower_components/marked/lib/marked.js',
                    'bower_components/codemirror/lib/codemirror.js',
                    'bower_components/backbone/backbone.js',
                    'bower_components/jquery-file-upload/js/jquery.fileupload.js',
                    'bower_components/highlight-js/src/highlight.js',
                    'bower_components/blueimp-gallery/js/blueimp-gallery.js'
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
                flatten: true
            },
            scripts: {
                src: ['**'],
                dest: 'core/build/js',
                cwd: 'core/template/back-end/assets/js/',
                expand: true,
                flatten: true
            },
            js: {
                files: [
                    {
                        src: 'bower_components/jquery/dist/jquery.js',
                        dest: 'core/build/js'
                    },
                    {
                        src: 'bower_components/jquery/dist/jquery.js',
                        dest: 'content/themes/serenader/js'
                    }
                ]
            },
            css: {
                files: [
                    {
                        src: 'core/template/back-end/assets/css/common.css',
                        dest: 'core/build/css/common.css'
                    }
                ]
            },
            font: {
                cwd: 'bower_components/fontawesome/fonts/',
                src: '**',
                dest: 'core/build/fonts/',
                expand: true,
                flatten: true
            },
            client: {
                files: [
                    {
                        src: 'core/template/front-end/*',
                        dest: 'content/themes/serenader/'
                    }
                ]
            }
        },

        express: {
            options: {
                script: 'index.js',
                output: 'Serenader is running'
            }
        }
    };


    grunt.initConfig(config);

    grunt.registerTask('test', 'Run tests and lint code', 
        ['jshint']);

    grunt.registerTask('init', 'Initialize the project', 
        ['shell:bower']);

    grunt.registerTask('build', 'Build the project', 
        ['concat:libraries', 'uglify:script','sass:compressed', 'copy']);

    grunt.registerTask('dev', 'Running project in dev env', 
        ['concat:libraries', 'sass:compress', 'copy:js', 'watch', 'express']);

    grunt.registerTask('t', 'test', ['copy:ace']);
};