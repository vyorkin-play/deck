import { Component } from 'react';
import Button from '../Button';
import styles from './styles';

export default class Demo1 extends Component {
  state = { component: null };

  loadComponent = (name: string) => {
    System.import('./things/' + name) // eslint-disable-line prefer-template
      .then(component => this.setState({ component: component.default }))
      .catch(err => console.log(err)); // eslint-disable-line no-console
  }

  render() {
    const { component } = this.state;
    return (
      <div className={styles.app}>
        <h1>My App</h1>
        <p>commit: {__COMMITHASH__}</p>
        <p>env: {__ENV__}</p>
        <div className={styles.figure}>1</div>
        {component && component()}
        <Button title='load foo' onClick={() => this.loadComponent('Foo')} />
        <Button title='load bar' onClick={() => this.loadComponent('Bar')} />
      </div>
    );
  }
}
