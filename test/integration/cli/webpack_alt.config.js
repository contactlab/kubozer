const path = require('path');

module.exports = {
  entry : path.join(__dirname, 'src/app/index_alt.js'),
  output: {
    path    : path.join(__dirname, 'build'),
    filename: 'bundle_alt.js'
  },
  devtool: 'source-map',
  module : {
    loaders: [{
      test   : /\.js?$/,
      exclude: ['node_modules', 'test/bundle.js', 'test/build'],
      loader : 'babel-loader'
    }]
  }
};
