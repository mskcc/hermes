const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const beagleUrl = process.env.BEAGLE_URL || 'http://localhost:8000';


module.exports = (env, options) => ({
    entry: {
        'app': glob.sync('./vendor/**/*.js').concat(['./js/app.js']),
        'samples-list': './js/samples/list/index.tsx',
        'samples-show': './js/samples/show/index.ts'
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        alias: {
        },
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../priv/static/js')
    },

    module: {
        rules: [
            {
                test: /\.js|\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.[s]?css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '',
                        },
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            publicPath: '',
                            outputPath: '../fonts/'
                        }
                    }
                ]
            }
        ]
    },
        optimization: {
            minimizer: ['...', new CssMinimizerPlugin()],
        },
        plugins: [
            new MiniCssExtractPlugin({ filename: '../css/app.css' }),
            new CopyWebpackPlugin({ patterns: [{ from: 'static/', to: '../' }] }),
        ],
});
