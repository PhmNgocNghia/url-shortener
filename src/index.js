import React from 'react';
import ReactDOM from 'react-dom';
import ky from 'ky';
import './styles';
import App from './App';

const init = () => {
  window.addEventListener(
    'load',
    () => {
      // cold-start ping
      ky.post('/.netlify/functions/shortener', { json: { ping: true } });
    },
    false,
  );
};

const render = Component => {
  ReactDOM.render(<Component />, document.getElementById('app'));
};

init();

render(App);
