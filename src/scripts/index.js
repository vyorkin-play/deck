// @flow

import { AppContainer } from 'react-hot-loader';
import { render } from 'react-dom';
import App from './App';

const getMain = () => <AppContainer><App /></AppContainer>;

const rootEl = document.getElementById('root');
render(getMain(), rootEl);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(getMain(), rootEl);
  });
}
