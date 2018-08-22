import React from 'react'
import { Provider } from 'react-redux'
import configureStore from './store'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import Home from './Home'
import Login from './Login'
import Game from './Game'

import './App.css'

const initialState = window.__INITIAL_STATE__ || { firebase: { authError: null } }
const store = configureStore(initialState)

export default () => (
  <Provider store={store}>
    <Router>
      <div>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>

        <Route path="/" exact component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/game/*" component={Game} />
      </div>
    </Router>

  </Provider>
)
