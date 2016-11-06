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
  noInfo: true,
  stats: 'errors-only',
}));

app.use(hotMiddleware(compiler));
app.use('*', (req, res, next) => {
  const filename = join(compiler.outputPath, 'index.html');
  compiler.outputFileSystem.readFile(filename, (err, result) => {
    if (err) {
      return next(err);
    }
    res.set('content-type', 'text/html');
    res.send(result);
    return res.end();
  });
});

/* eslint-disable no-console */
app.listen(3000, (err) => {
  if (err) console.error(err);
});
/* eslint-enable no-console */
