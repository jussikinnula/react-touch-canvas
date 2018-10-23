import * as React from 'react';
import { render } from 'react-dom';
import App from './App';
import './index.styl'

if (process.env.REMOTE_LOG) {
  require('remote-log-websocket').default(process.env.REMOTE_LOG)
  setTimeout(() => console.log('Hello remote!'), 500)
}

const element = document.createElement('div');
document.body.appendChild(element);
render(<App />, element, null);
