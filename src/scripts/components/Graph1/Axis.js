// @flow

import { Component } from 'react';
import { upperFirst } from 'lodash/fp';
import * as d3 from 'd3';
import styles from './styles';

type Props = {
  orient: string,
  ticks: number,
  scale: (x: number) => number,
  translate: string,
};

type DefaultProps = {
  ticks: number;
};

export default class Axis extends Component<DefaultProps, Props, void> {
  _axisNode: any;

  static defaultProps = {
    ticks: 5,
  };

  componentDidMount() {
    this.renderAxis();
  }

  componentDidUpdate() {
    this.renderAxis();
  }

  renderAxis() {
    const { orient, ticks, scale } = this.props;

    const axisFnName = `axis${upperFirst(orient)}`;
    const axis = d3[axisFnName]()
      .ticks(ticks)
      .scale(scale);

    d3.select(this._axisNode).call(axis);
  }

  render() {
    return (
      <g
        className={styles.axis}
        ref={r => { this._axisNode = r; }}
        transform={this.props.translate}
      />
    );
  }
}
