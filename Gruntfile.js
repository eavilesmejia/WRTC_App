/**
 * Created by gmena on 01-05-16.
 */
var path = require('path');

module.exports = function (grunt) {

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-webpack');
    //grunt.loadNpmTasks('grunt-jscs');
    //grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        webpack: {
            wrtc: {
                entry: {
                    home: ['./src/js/pages/index.js']
                },
                output: {
                    path: __dirname + "/dist",
                    filename: '[name].js' // Or [name]
                },
                stats: {
                    // Configure the console output
                    colors: true,
                    modules: true,
                    reasons: true
                },
                // Stats: false disables the stats output

                watch: true, // Use webpacks watcher
                // You need to keep the grunt process alive

                keepalive: true, // Don't finish the grunt task
                // Use this in combination with the watch option

                failOnError: false, // Don't report error to grunt if webpack find errors
                // Use this if webpack errors are tolerable and grunt should continue

                module: {
                    loaders: [
                        {
                            test: /\.jsx?$/,
                            exclude: /node_modules/,
                            loader: 'babel-loader',
                            query: {
                                presets: ['es2015', 'react']
                            }
                        }
                    ]
                },
                resolve: {
                    modulesDirectories: [
                        'node_modules'
                    ]
                }
            }
        },
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
