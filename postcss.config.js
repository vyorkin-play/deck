const { resolve } = require('path');

/* eslint-disable quote-props */
module.exports = ctx => ({
  map: ctx.env === 'development' ? ctx.map : false,
  from: ctx.form,
  to: ctx.to,
  plugins: {
    'stylelint': {},
    'postcss-import': {
      addDependencyTo: ctx.webpack,
      path: [resolve(__dirname, 'src/styles')],
    },
    'postcss-svg': {
      paths: [resolve(__dirname, 'src/assets/svg')],
      svgo: ctx.env === 'production',
    },
    'postcss-assets': {
      loadPaths: [
        'assets',
        'scripts',
      ],
      basePath: resolve(__dirname, 'src'),
      cachebuster: ctx.env === 'production',
    },
    'postcss-size': {},
    'postcss-position': {},
    'postcss-cssnext': { warnForDuplicates: ctx.env === 'development' },
    'postcss-font-magician': {},
    'postcss-reporter': ctx.env === 'development' ? {} : false,
    'postcss-browser-reporter': ctx.env === 'development' ? { selector: 'body:after' } : false,
    'cssnano': ctx.env === 'production' ? {} : false,
  },
});
/* eslint-enable quote-props */
