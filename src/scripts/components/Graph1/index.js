// @flow

import { Component } from 'react';
import * as d3 from 'd3';
import Axis from './Axis';
import styles from './styles';

const rand = () => 100 + Math.floor(Math.random() * 1000);
const randomNumbers = (length: number = 10) =>
  Array.from({ length }).map(() => [rand(), rand()]);

const maxByIdx = (idx: number) => (data: number[][]) => d3.max(data, d => d[idx]);
const xMax = maxByIdx(0);
const yMax = maxByIdx(1);

type MaxFn = (data: number[][]) => number;
type Range = {
  min: number,
  max: number,
};

const scale = (max: MaxFn) => (r: Range, data: number[][]) =>
  d3.scaleLinear()
    .domain([0, max(data)])
    .range([r.min, r.max]);

const xScale = scale(xMax);
const yScale = scale(yMax);

type Props = {
  width: number,
  height: number,
  padding: number,
};

type State = {
  data: number[][],
};

export default class Graph1 extends Component<Props, Props, State> {
  static defaultProps = {
    width: 600,
    height: 600,
    padding: 40,
  };

  state = { data: [] };

  _handleRandomize = () => this.setState({ data: randomNumbers() });

  render() {
    const { width, height, padding } = this.props;
    const { data } = this.state;

    const ranges = {
      x: {
        min: padding,
        max: width - padding,
      },
      y: {
        min: height - padding,
        max: padding,
      },
    };

    const scales = {
      x: xScale(ranges.x, data),
      y: yScale(ranges.y, data),
    };

    return (
      <div className={styles.container}>
        <div className={styles.controls}>
          <button className={styles.button} onClick={this._handleRandomize}>
            randomize
          </button>
        </div>
        <svg className={styles.graph} {...{ width, height }}>
          <g>{data.map(([x, y], idx) => ({
            x: scales.x(x),
            y: scales.y(y),
            idx,
          })).map(({ x, y, idx }) => (
            <g>
              <circle
                key={idx} className={styles.circle}
                cx={x} cy={y} r={5}
              />
              <text x={x} y={y - 10} className={styles.text}>
                {`${x.toFixed(2)}, ${y.toFixed(2)}`}
              </text>
            </g>
          ))}</g>
          <g>
            <Axis
              orient='bottom'
              scale={scales.x}
              translate={`translate(0, ${ranges.y.min})`}
            />
            <Axis
              orient='left'
              scale={scales.y}
              translate={`translate(${ranges.x.min}, 0)`}
            />
          </g>
        </svg>
      </div>
    );
  }
}
