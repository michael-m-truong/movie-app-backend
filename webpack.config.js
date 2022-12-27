const path = require('path');
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'final.js',
  },
  externals: [nodeExternals()],
  target: 'node',
};