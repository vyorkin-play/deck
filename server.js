const { join } = require('path');
const webpack = require('webpack');
const express = require('express');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const getConfig = require('./webpack.config');

const app = express();
const config = getConfig({ development: true });
const compiler = webpack(config);

app.use(devMiddleware(compiler, {
  publicPath: config.output.publicPath,
  historyApiFallback: true,
}));

app.use(hotMiddleware(compiler));

app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist/index.html')));

/* eslint-disable no-console */
app.listen(3000, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Listening at http://localhost:3000/');
  }
});
/* eslint-enable no-console */
