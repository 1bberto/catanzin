const path = require('path');
const webpack = require('webpack');

const contentBase = path.join(__dirname, 'dist');

module.exports = {
  mode: 'development',
  entry: {
    game: './server/web/room/game.ts',
    room: './server/web/room/room.ts',
    site: './server/assets/js/site.ts'
  },
  output: {
    filename: '[name].bundle.js',
    path: contentBase
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: 'raw-loader'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /html-templates.js/,
      'html-templates.webpack.js'
    )
  ],
  devServer: {
    contentBase,
    compress: true,
    overlay: true,
    port: 5000,
    hotOnly: true,
    proxy: [
      {
        context: '/',
        target: 'http://localhost:3000'
      }
    ],
    publicPath: '/bundles/'
  }
};
