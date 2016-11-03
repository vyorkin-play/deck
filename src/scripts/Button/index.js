// @flow

import { Component } from 'react';
import classnames from 'classnames';
import styles from './styles';

type Props = {
  title: string,
  visited: boolean,
  onClick: () => void,
};

type DefaultProps = {
  visited: boolean,
};

type State = {
  display: 'static' | 'hover' | 'active',
};

type MouseFn = () => void;

export default class Button extends Component<DefaultProps, Props, State> {
  static defaultProps = { visited: false };
  state = { display: 'static' };

  onMouseEnter: MouseFn = () => this.setState({ display: 'hover' });
  onMouseLeave: MouseFn = () => this.setState({ display: 'static' });
  onMouseDown: MouseFn = () => this.setState({ display: 'active' });

  render() {
    const className = classnames(
      styles.button,
      styles[this.state.display], {
        [styles.visited]: this.props.visited,
      }
    );

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div
        className={className}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseDown={this.onMouseDown}
        onClick={this.props.onClick}
      >
        {this.props.title}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}
