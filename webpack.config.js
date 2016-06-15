var path = require('path');

//Build
module.exports = {
    entry: {
        index: ['./src/js/pages/index.js']
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
};
