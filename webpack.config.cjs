const path = require('path');

module.exports = {
  mode: 'development',
  entry: './public/server.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
