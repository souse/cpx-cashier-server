var path = require('path');
var webpack = require('webpack');
var base = require('./webpack.config');
var packageInfo = require('./package.json');

base.devtool = 'source-map'; //eval-source-map
base.entry.unshift('webpack-hot-middleware/client');
base.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
  		'process.env.NODE_ENV': JSON.stringify('development')
		,'VERSION': JSON.stringify(packageInfo.version)
	})
);

module.exports = base;