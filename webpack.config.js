const { join, resolve } = require('path');
const { castArray, pick, compact, isFunction } = require('lodash/fp');
const chalk = require('chalk');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const combineLoaders = require('webpack-combine-loaders');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const pkg = require('./package');

const paths = {
  src: resolve(__dirname, 'src'),
  assets: resolve(__dirname, 'src/assets'),
  templates: resolve(__dirname, 'src/templates'),
  styles: resolve(__dirname, 'src/styles'),
  scripts: resolve(__dirname, 'src/scripts'),
};

const getKnownEnvironments = pick(['test', 'development', 'staging', 'production']);

const baseLoader = (loader, test, prefix, options = {}) => ({
  loader,
  test,
  include: paths.src,
  options: Object.assign({}, { // eslint-disable-line prefer-object-spread/prefer-object-spread
    name: '[name].[ext]',
    prefix: `${prefix}/`,
  }, options),
});

const urlLoader = (test, prefix) => baseLoader(
  'url', test, prefix, { limit: 1024 }
);

module.exports = env => {
  const environments = getKnownEnvironments(env);
  const environmentName = Object.keys(environments)
    .find(key => !!env[key]) || 'production';

  const evaluate = fn => isFunction(fn) ? fn() : fn;
  const ifVar = (name, value, fallback) => evaluate(env[name] ? value : fallback);
  const ifEnv = (name, maybeFn, fallback) => {
    const names = castArray(name);
    if (names.includes(environmentName)) {
      return evaluate(maybeFn);
    } else if (fallback !== undefined) {
      return evaluate(fallback);
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
        localIdentName: ifEnv(
          'development',
          '[name]-[local]--[hash:base64:5]',
          '[hash:base64:5]'
        ),
      },
    },
    'postcss',
  ];

  return {
    entry: {
      app: compact([
        ifEnv('development', 'react-hot-loader/patch'),
        ifEnv('development', 'webpack-hot-middleware/client'),
        'babel-polyfill',
        './scripts/index',
      ]),
      vendor: [
        'babel-polyfill',
        'react',
        'react-dom',
        'lodash',
        'classnames',
        'recompose',
      ],
    },
    output: {
      filename: ifEnv('production', '[name].[chunkhash].js', '[name].js'),
      path: resolve(__dirname, 'dist'),
      publicPath: '',
      pathinfo: !env.production,
    },
    context: resolve(__dirname, 'src'),
    devtool: ifEnv(
      ['production', 'staging'],
      ifEnv('staging', 'source-map', false),
      'eval-source-map'
    ),
    bail: env.production,
    resolve: {
      modules: [
        paths.scripts,
        'node_modules',
      ],
      extensions: ['.js', '.json', '.css', '.svg'],
      alias: {
        assets: paths.assets,
      },
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
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: combineLoaders(cssLoaders),
          }),
          include: [
            paths.styles,
            paths.scripts,
          ],
        }), {
          test: /\.css$/,
          use: ['style', ...cssLoaders],
          include: [
            paths.styles,
            paths.scripts,
          ],
        }),
        {
          test: /\.pug$/,
          loader: 'pug',
          include: paths.templates,
        },
        {
          test: /\.txt(\?.+)?$/,
          loader: 'raw',
          include: [
            paths.assets,
            paths.scripts,
          ],
        },
        {
          test: /\.json(\?.+)?$/,
          loader: 'json',
          include: [
            paths.assets,
            paths.scripts,
          ],
        },
        {
          test: /\.svg(\?.+)?$/,
          loader: 'svg-inline',
          include: paths.scripts,
        },
        urlLoader(/\.(jpe?g|png|gif)(\?.+)?$/i, 'images'),
        urlLoader(/\.woff(\?.+)?$/, 'fonts'),
        urlLoader(/\.woff2(\?.+)?$/, 'fonts'),
        urlLoader(/\.ttf(\?.+)?$/, 'fonts'),
        urlLoader(/\.eot(\?.+)?$/, 'fonts'),
      ],
    },
    plugins: compact([
      new webpack.ProvidePlugin({
        React: 'react',
      }),
      new HtmlWebpackPlugin({
        title: pkg.description,
        template: 'templates/index.pug',
      }),
      new ProgressBarPlugin({
        width: 12,
        format: `[${chalk.blue(':bar')}] ${chalk.green.bold(':percent')} ${chalk.magenta(':msg')} (:elapsed seconds)`,
        clear: true,
        summary: false,
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
      }),
      new LodashModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        __DEVELOPMENT__: environmentName === 'development',
        __PRODUCTION__: environmentName === 'production',
        __ENV__: JSON.stringify(environmentName),
        __COMMITHASH__: JSON.stringify(new GitRevisionPlugin().commithash()),
        'process.env': { NODE_ENV: JSON.stringify(environmentName) },
      }),
      ifEnv(['production', 'staging'], () => new FaviconsWebpackPlugin({
        logo: join(paths.assets, 'logo.png'),
        prefix: 'icons-[hash]/',
        statsFilename: 'icons-[hash]/stats.json',
        title: pkg.name,
        inject: true,
      })),
      ifEnv('development', () => new webpack.HotModuleReplacementPlugin()),
      ifEnv(['production', 'staging'], () => new webpack.optimize.DedupePlugin()),
      ifEnv(['production', 'staging'], () => new webpack.LoaderOptionsPlugin({
        minimize: !!env.unminified,
        debug: !!env.debug,
      })),
      ifEnv(['production', 'staging'], () => new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false,
        },
      })),
      ifEnv(['production', 'staging'], () => new ExtractTextPlugin('[name].[chunkhash].css')),
      ifVar('analyze', () => new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: 8888,
        reportFilename: 'webpack.stats.html',
        openAnalyzer: true,
        generateStatsFile: !!env.stats,
        statsFilename: 'webpack.stats.json',
      })),
    ]),
  };
};
