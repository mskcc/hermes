const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
    const devMode = options.mode !== 'production';

    return {
        entry: {
            app: glob.sync('./vendor/**/*.js').concat(['./js/app.js']),
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            alias: {
                react: path.resolve(__dirname, './node_modules/react'),
                'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
                '@': path.resolve(__dirname, 'js/react_components'),
            },
        },
        output: {
            path: path.resolve(__dirname, '../priv/static/js'),
            filename: '[name].js',
            publicPath: '/js/',
        },
        devtool: devMode ? 'source-map' : undefined,
        module: {
            rules: [
                {
                    test: /\.js|\.jsx$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'file-loader',
                    options: { name: '[name].[ext]', outputPath: '../fonts' },
                },
                {
                    test: /\.[s]?css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: '/css/',
                            },
                        },
                        'css-loader',
                        'sass-loader',
                    ],
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
            ],
        },
        optimization: {
            minimizer: ['...', new CssMinimizerPlugin()],
        },
        plugins: [
            new MiniCssExtractPlugin({ filename: '../css/app.css' }),
            new CopyWebpackPlugin({ patterns: [{ from: 'static/', to: '../' }] }),
        ],
    };
};
