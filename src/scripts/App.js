// @flow

import { Component } from 'react';
import Button from './Button';

export default class App extends Component {
  handleClick = () => {
    console.log('clicked'); // eslint-disable-line no-console
  }

  render() {
    return (
      <div>
        <h1>My App</h1>
        <Button title='click me' onClick={this.handleClick} />
      </div>
    );
  }
}
