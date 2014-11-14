module.exports = function (grunt) {
    var config,
        path = require('path');

    require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

    config = {
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    'core/view/*',
                    'core/view/assets/js/serenader.js',
                    'core/view/assets/css/style.css',
                    'core/view/assets/css/sign.css'
                ]
            },
            script: {
                files: [
                    'core/view/assets/js/*.js',
                    '!core/view/assets/js/vendor.js',
                    '!core/view/assets/js/serenader.js'
                ],
                tasks: ['concat:serenader']
            },
            sass: {
                files: ['core/view/assets/css/*.scss'],
                tasks: ['css']
            }
        },

        copy: {
            ace: {
                cwd: 'bower_components/ace/',
                src: ['**'],
                dest: 'core/view/assets/ace/',
                expand: true
            },
            js: {
                files: [
                    {'core/view/assets/js/jquery.min.js': 'bower_components/jquery/dist/jquery.min.js'},
                    {'core/view/assets/js/jquery.min.map': 'bower_components/jquery/dist/jquery.min.map'}
                ]
            },
            font: {
                files: [
                    {
                        cwd: 'bower_components/material-design-icon/fonts/',
                        src: ['**'],
                        dest: 'core/view/assets/fonts/',
                        expand: true
                    },
                    {
                        cwd: 'bower_components/material-design-icon/css/',
                        src: 'md-icon.min.css',
                        dest: 'core/view/assets/css/',
                        expand: true
                    }
                ]
            },
            css: {
                files: [
                    {
                        cwd: 'bower_components/blueimp-gallery/css/',
                        src: 'blueimp-gallery.min.css',
                        dest: 'core/view/assets/css/',
                        expand: true
                    },
                    {
                        cwd: 'bower_components/blueimp-gallery/img/',
                        src: ['**'],
                        dest: 'core/view/assets/img/',
                        expand: true
                    },
                    {
                        cwd: 'bower_components/codemirror/lib/',
                        src: 'codemirror.css',
                        dest: 'core/view/assets/css/',
                        expand: true
                    }
                ]
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

        uglify: {
            default: {
                files: {
                    'core/view/assets/js/vendor.js': 'core/view/assets/js/vendor.js',
                    'core/view/assets/js/serenader.js': 'core/view/assets/js/serenader.js'
                }
            }
        },

        sass: {
            compile: {
                options: {
                    outputStyle: 'nested'
                },
                files: [
                    {
                        src: 'core/view/assets/css/style.scss',
                        dest: 'core/view/assets/css/style.css'
                    },
                    {
                        src: 'core/view/assets/css/sign.scss',
                        dest: 'core/view/assets/css/sign.css'
                    }

                ]
            },
            compress: {
                options: {
                    outputStyle: 'compressed'
                },
                files: [
                    {
                        src: 'core/view/assets/css/style.scss',
                        dest: 'core/view/assets/css/style.css'
                    },
                    {
                        src: 'core/view/assets/css/sign.scss',
                        dest: 'core/view/assets/css/sign.css'
                    }                    
                ]
            }
        },

        autoprefixer: {
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

        concat: {
            libraries: {
                dest: 'core/view/assets/js/vendor.js',
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/jquery-file-upload/js/vendor/jquery.ui.widget.js',
                    'bower_components/lodash/dist/lodash.js',
                    'bower_components/backbone/backbone.js',
                    'bower_components/jquery-file-upload/js/jquery.fileupload.js',
                    'bower_components/blueimp-gallery/js/blueimp-gallery.js',
                    'bower_components/codemirror/lib/codemirror.js',
                    'bower_components/marked/lib/marked.js',
                ]
            },
            serenader: {
                dest: 'core/view/assets/js/serenader.js',
                src: [
                    'core/view/assets/js/script.js',
                    'core/view/assets/js/sign.js',
                    'core/view/assets/js/post.js',
                    'core/view/assets/js/gallery.js',
                    'core/view/assets/js/file.js',
                    'core/view/assets/js/panel.js'
                ]
            }
        },

        update_submodules: {
            default: {
                options: {}
            }
        },

        express: {
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

        clean: {

        }
    };

    grunt.initConfig(config);

    grunt.registerTask('init', 'Download and copy the dependencies.', 
        ['shell:bower', 'update_submodules', 'copy']);

    grunt.registerTask('default', 'Compile the css and the js file.', 
        ['css', 'concat']);

    grunt.registerTask('dev', 'Running project in the dev env.', 
        ['default', 'express', 'watch']);

    grunt.registerTask('css', 'Building css file.', 
        ['sass:compile', 'autoprefixer']);

    grunt.registerTask('prod-css', 'Building production env css.', 
        ['sass:compress', 'autoprefixer']);

    grunt.registerTask('prod', 'Building the production env', 
        ['prod-css', 'concat', 'uglify', 'clean']);
};