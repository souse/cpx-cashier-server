var path = require('path');
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var distPath = path.join(__dirname, 'dist');

module.exports = {
  devtool: 'source-map',
  entry: [
    './src/index'
  ],
  // entry: {
  //   index: './src/index'
  // },
  output: {
    path: distPath,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title:'test',
      template: __dirname + '/index.html'
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/,
        include: __dirname
      },
      {
        test: /\.css?$/,
        loaders : [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.less?$/,
        loaders : [
          'style-loader',
          'css-loader',
          'less-loader?{"sourceMap":true}'
        ],
        include: __dirname
      },
      { test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'url',
        query: {
          limit: 10240,
          //name: 'static/images/[sha512:hash:base64:7].[ext]'
          name: 'static/images/[name].[ext]'
        }
      }
    ]
  }
};
