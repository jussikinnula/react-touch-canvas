import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import { connect } from 'remote-log-websocket'
import { HomePage } from './HomePage'
import { NormalCanvasPage } from './NormalCanvasPage'
import { WebGLCanvasPage } from './WebGLCanvasPage'
import './index.styl'

if (process.env.REMOTE_LOG) {
  connect(process.env.REMOTE_LOG)
  setTimeout(() => console.log('Hello remote!'), 500)
}

const App = () => (
  <Router>
    <div>
      <nav className="App-Nav">
        <Link className="App-Nav-Link" to="/">Home</Link>
        <Link className="App-Nav-Link" to="/normal-canvas/">Normal Canvas</Link>
        <Link className="App-Nav-Link" to="/webgl-canvas/">WebGL Canvas</Link>
      </nav>

      <Route path="/" exact component={HomePage} />
      <Route path="/normal-canvas/" component={NormalCanvasPage} />
      <Route path="/webgl-canvas/" component={WebGLCanvasPage} />
    </div>
  </Router>
)

const element = document.createElement('div');
document.body.appendChild(element);
render(<App />, element, null);
