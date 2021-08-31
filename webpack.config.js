const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        index: './client-src/index.js',
    },
    mode: 'development',
    optimization: {
        usedExports: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "client-src/index.html"
        })
    ],
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'client-dist'),
        clean: true
    },
};