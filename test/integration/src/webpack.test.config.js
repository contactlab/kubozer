const path = require('path');

module.exports = {
  entry : path.join(__dirname, 'app', 'index.js'),
  output: {
    path    : path.join(__dirname, '..', 'build'),
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module : {
    loaders: [{
      test   : /\.js?$/,
      exclude: ['node_modules', 'app/assets/bower', 'app/bundle.js', 'build'],
      loader : 'babel-loader'
    }]
  }
};
