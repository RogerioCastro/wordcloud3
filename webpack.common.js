const path = require('path');

module.exports = {
  entry: {
    wordcloud: './src/main.js'
  },
  plugins: [
    //
  ],
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'Wordcloud',
      type: 'umd',
      export: 'default'
    },
    clean: false,
  },
  /* optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }, */
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ],
  }
};
