var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
const path = require('path');
const port = process.env.POINTER_PORT || 8080;
const beagleUrl = process.env.BEAGLE_URL || 'http://localhost:8000';
const host = process.env.POINTER_HOST || "0.0.0.0";
const allowedHost = process.env.POINTER_ALLOWED_HOST_LIST || "localhost";
module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8000, // Convert images < 8kb to base64 strings
                            name: 'public/[hash]-[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: [path.resolve(__dirname, 'node_modules/react-native-fetch-blob')],
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.web.js', '.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
    },
    devtool: 'eval',
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new webpack.SourceMapDevToolPlugin({}),
    ],
    devServer: {
        historyApiFallback: true,
        host: host,
	    port: port,
	    allowedHosts: allowedHost.split(','),
    },
    externals: {
        // global app config object
        config: JSON.stringify({
            apiUrl: beagleUrl,
        }),
    },
    output: {
        publicPath: '/',
    },
};
