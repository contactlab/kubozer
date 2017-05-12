module.exports = {
  entry: './test/src-test/app/index.js',
  output: {
    // Make sure to use [name] or [id] in output.filename
    //  when using multiple entry points
    path: './test/build',
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js?$/,
      // exclude: /(node_modules|bower_components)/,
      exclude: ['node_modules', 'test/bundle.js', 'test/build'],
      loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
      query: {
        presets: ['es2015'],
        plugins: ['transform-es2015-spread', 'syntax-object-rest-spread', 'transform-object-rest-spread']
      }
    }]
  }
};
