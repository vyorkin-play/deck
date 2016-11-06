import type { Component } from 'recompose';
import { compose, setDisplayName, defaultProps } from 'recompose';

type Props = {
  className?: string,
  value: string,
  width?: number,
  height?: number,
  fill?: string,
};

const icons = require.context('svg-sprite!assets/svg', false, /^\.\/.*\.svg$/);
const iconFileNames = icons.keys();

const Icon: Component<Props> = compose(
  setDisplayName('Icon'),
  defaultProps({
    width: 64,
    height: 64,
    fill: '#383838',
  }),
)(({ className, value, fill, width, height }: Props) => (
  <svg style={{ fill }} {...{ className, width, height }}>
    <use xlinkHref={icons(`./${value}.svg`)} />
  </svg>
));

export const hasIcon = (icon: string) => iconFileNames.includes(`./${icon}.svg`);
export default Icon;
