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
