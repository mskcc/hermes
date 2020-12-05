const path = require('path');
const glob = require('glob');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin-fixed-hashbug');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
    const devMode = options.mode !== 'production';

    return {
        optimization: {
            minimizer: [
                new TerserPlugin({ cache: true, parallel: true, sourceMap: devMode }),
                new OptimizeCSSAssetsPlugin({}),
            ],
        },
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
            filename: '[name].js',
            path: path.resolve(__dirname, '../priv/static/js'),
            publicPath: '/js/',
        },
        devtool: devMode ? 'eval-cheap-module-source-map' : undefined,
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
                },

                {
                    test: /\.[s]?css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
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
        plugins: [
            new MiniCssExtractPlugin({ filename: '../css/app.css' }),
            new CopyWebpackPlugin([{ from: 'static/', to: '../' }]),
        ].concat(devMode ? [new HardSourceWebpackPlugin()] : []),
    };
};
