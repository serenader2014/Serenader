module.exports = function (grunt) {
    var config;

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
            
        }
    };
};