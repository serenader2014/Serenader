module.exports = function (grunt) {
    var config,
        path = require('path');

    require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

    config = {
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            script: {
                files: [],
                tasks: ['concat']
            },
            sass: {
                files: [],
                tasks: ['sass']
            },

        },

        sass: {
            compress: {
                options: {
                    style: 'compressed',
                    sourceMap: true
                },
                files: [
                    {
                        dest: path.resolve('core/build/css/style.min.css'),
                        src: path.resolve('core/template/back-end/assets/css/*.scss')
                    }
                ]
            }
        },

        concat: {

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
            js: {
                files: [
                    {
                        src: path.resolve('core/template/back-end/assets/js/*.js'),
                        dest: path.resolve('core/build/js/')
                    },
                    {
                        
                    }
                ]
            }
        }
    };
};