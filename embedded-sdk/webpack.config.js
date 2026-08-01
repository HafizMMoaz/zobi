const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'bundle'),

    // this exposes the library's exports under a global variable
    library: {
      name: "zobiEmbeddedSdk",
      type: "umd"
    }
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        // babel-loader is faster than ts-loader because it ignores types.
        // We do type checking in a separate process, so that's fine.
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
