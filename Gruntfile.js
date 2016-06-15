/**
 * Created by gmena on 01-05-16.
 */
var path = require('path');
var webPackConf = require('./webpack.config');

module.exports = function (grunt) {

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-webpack');
    //grunt.loadNpmTasks('grunt-jscs');
    //grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        webpack: {
            wrtc: Object.create(webPackConf),
            jscs: {
                src: './system/*/*/*.js',
                options: {
                    config: '.jscsrc',
                    force: true,
                    esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
                    verbose: false, // If you need output with rule names http://jscs.info/overview.html#verbose
                    fix: true // Autofix code style violations when possible.
                }
            },
            karma: {
                unit: {
                    configFile: 'karma.conf.js'
                }
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', [
        'webpack'
    ]);

    //// Default task(s).
    //grunt.registerTask('code', [
    //    'jscs'
    //]);
    //
    //// Default task(s).
    //grunt.registerTask('test', [
    //    'karma'
    //]);

};
