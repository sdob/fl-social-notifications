const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

// We need these for a few things
const { name, version } = require(path.join(__dirname, 'package.json'));

// Copy the manifest.json, inserting the current version as we go
const copy = new CopyWebpackPlugin([
  {
    context: './src/',
    from: 'manifest.json',
    to: 'manifest.json',
    transform: (content) => {
      return content.toString().replace('\$VERSION', `${version}`);
    },
  },
]);

const zip = new ZipPlugin({
  path: path.join(__dirname, 'dist'),
  filename: `${name}-${version}.zip`,
});

module.exports = {
  entry: {
    'content-script.js': './src/content-script.js',
  },
  output: {
    path: path.join(__dirname, 'build/'),
    filename: '[name]',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextWebpackPlugin.extract({
          use: ['css-loader', 'sass-loader']
        }),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        },
      },
    ],
  },
  plugins: [
    copy,
    zip,
    new webpack.DefinePlugin({ DEBUG: JSON.stringify(process.env.NODE_ENV !== 'production') }),
    new ExtractTextWebpackPlugin('styles.css'),
  ],
};
