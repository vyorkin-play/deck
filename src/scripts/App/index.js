import { Component } from 'react';
import Graph1 from '../components/Graph1';
import styles from './styles';

export default class App extends Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className={styles.app}>
        <Graph1 />
      </div>
    );
  }
}
