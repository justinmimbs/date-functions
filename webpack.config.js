var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        'test/spec': './test/index.js'
    },
    output: {
        path: './',
        filename: '[name].js',
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
            }
        ]
    }
};
