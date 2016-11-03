const size = require('postcss-size');
const position = require('postcss-position');

module.exports = ctx => {
  const plugins = [
    size,
    position,
  ].map(p => p(ctx.plugin));

  return {
    parser: 'sugarss',
    from: ctx.form,
    to: ctx.to,
    plugins,
  };
};
