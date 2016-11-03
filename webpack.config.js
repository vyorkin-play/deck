const { resolve } = require('path');
const { compact, isFunction } = require('lodash/fp');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const combineLoaders = require('webpack-combine-loaders');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const paths = {
  templates: resolve(__dirname, 'src/templates'),
  scripts: resolve(__dirname, 'src/scripts'),
};

module.exports = environment => {
  const environmentName = Object.keys(environment)
    .find(key => !!environment[key]) || 'production';

  const ifEnv = (name, fn, fallback) => {
    if (environmentName === name) {
      return isFunction(fn) ? fn() : fn;
    } else if (fallback !== undefined) {
      return isFunction(fallback) ? fallback() : fallback;
    }
    return null;
  };

  const cssLoaders = [
    {
      loader: 'css',
      options: {
        modules: true,
        importLoaders: 1,
        sourceMap: ifEnv('development', true, false),
      },
    },
    'postcss',
  ];

  return {
    entry: compact([
      ifEnv('development', 'react-hot-loader/patch'),
      ifEnv('development', 'webpack-hot-middleware/client'),
      'babel-polyfill',
      './scripts/index',
    ]),
    output: {
      filename: '[name].js',
      path: resolve(__dirname, 'dist'),
      publicPath: '/',
      pathinfo: !environment.production,
    },
    context: resolve(__dirname, 'src'),
    devtool: ifEnv('production', 'source-map', 'eval-source-map'),
    bail: environment.production,
    resolve: {
      modules: [
        paths.scripts,
        'node_modules',
      ],
      extensions: ['.js', '.json', '.sss'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'eslint',
          include: paths.scripts,
        },
        {
          test: /\.js$/,
          loader: 'babel',
          include: paths.scripts,
        },
        ifEnv('production', () => ({
          test: /\.sss$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: combineLoaders(cssLoaders),
          }),
          include: paths.scripts,
        }), {
          test: /\.sss$/,
          use: ['style', ...cssLoaders],
          include: paths.scripts,
        }),
        {
          test: /\.pug$/,
          loader: 'pug',
          include: paths.templates,
        },
      ],
    },
    plugins: compact([
      new webpack.ProvidePlugin({
        React: 'react',
      }),
      new HtmlWebpackPlugin({ template: 'templates/index.pug' }),
      ifEnv('development', () => new webpack.HotModuleReplacementPlugin()),
      ifEnv('production', () => new webpack.optimize.DedupePlugin()),
      ifEnv('production', () => new webpack.LoaderOptionsPlugin({
        minimize: !!environment.unminified,
        debug: !!environment.debug,
      })),
      ifEnv('production', () => new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false,
        },
      })),
      ifEnv('production', () => new ExtractTextPlugin('styles.css')),
      new LodashModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        // __COMMITHASH__: JSON.stringify(new GitRevisionPlugin().commithash()),
        'process.env': { NODE_ENV: JSON.stringify(environmentName) },
      }),
    ]),
  };
};
