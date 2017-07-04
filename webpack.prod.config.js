var path = require('path');
var webpack = require('webpack');
var base = require('./webpack.config');
//package.json
var packageInfo = require('./package.json');


base.devtool = 'source-map';

// use hash filename to support long-term caching
//[hash:8]改用版本号是为了更好的迭代版本，版本管理
//同时js 文件不变，这样为了能覆盖之前的资源，不会使硬盘无限变大
//js缓存问题 使用参数来解决，同时也兼容版本 一举二得
base.output.filename = 'static/[name].js?v='+packageInfo.version;
base.output.chunkFilename = 'static/[name].js?v='+packageInfo.version;
// add webpack plugins
base.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    'VERSION': JSON.stringify(packageInfo.version)
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compress: {
      warnings: false
    },
    output: {
      comments: false
    }
  }),
  // extract vendor chunks
  new webpack.optimize.CommonsChunkPlugin({
    name: 'static/vendor',
    filename: 'static/vendor.js?v='+packageInfo.version,
    minChunks: function (module, count) {
      return module.resource && module.resource.indexOf(path.resolve(__dirname, 'src')) === -1;
    }
  })
)

module.exports = base;
