let entry = './test/src-test/app/index.js';
let outputPath = './test/build';
let output = 'bundle.js';
let devtool = 'source-map';

module.exports = {
  entry,
  output: {
    // Make sure to use [name] or [id] in output.filename
    //  when using multiple entry points
		path: outputPath,
    filename: output
  },
	// stats: {
  //   colors: true,
  //   modules: true,
  //   reasons: true,
  //   errorDetails: true
  // },
  devtool: devtool,
  module: {
    loaders: [{
      test: /\.js?$/,
      // exclude: /(node_modules|bower_components)/,
      exclude: ['node_modules', 'app/assets/bower', 'app/bundle.js', 'build'],
      loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
      query: {
        presets: ['es2015'],
        plugins: ['transform-es2015-spread', 'syntax-object-rest-spread', 'transform-object-rest-spread']
      }
    }]
  }
};
