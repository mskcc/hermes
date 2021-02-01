const path = require('path');

module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:import/errors',
        'prettier', // this two prettier rule set must be the last thing
        'prettier/react',
    ],
    parser: '@babel/eslint-parser',
    parserOptions: {
        sourceType: 'module',
        allowImportExportEverywhere: false,
        ecmaFeatures: {
            globalReturn: false,
            jsx: true,
        },
        babelOptions: {
            configFile: path.resolve(__dirname, '.babelrc'),
        },
    },
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': ['error'],
        'react/prop-types': 'off',
        'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
    settings: {
        react: {
            version: 'latest',
        },
        'import/resolver': 'webpack',
        ignoreRestSiblings: true,
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
};
