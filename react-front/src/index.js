import 'react-app-polyfill/ie9'; // For IE 9-11 support
//import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import 'antd/dist/antd.css'
import './urm.scss'

import App from './App'
import * as serviceWorker from './serviceWorker'
import rootReducer from './store'

const store = createStore(rootReducer)

const Root = () => (
  <Provider store={store}>
    <BrowserRouter basename="URM">
      <App/>
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
