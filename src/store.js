import { createStore, compose } from 'redux'
import rootReducer from './reducer'
import { reactReduxFirebase } from 'react-redux-firebase'

export default function configureStore (initialState, history) {
  const createStoreWithMiddleware = compose(
    reactReduxFirebase(
      {
        apiKey: "AIzaSyDMfjLBn2NMXYXZzslN92PvuRk8eaebmHU",
        authDomain: "gedev-bab52.firebaseapp.com",
        databaseURL: "https://gedev-bab52.firebaseio.com",
        projectId: "gedev-bab52",
        storageBucket: "",
        messagingSenderId: "445145672721"
      },
      {
        userProfile: 'users', // where profiles are stored in database
        presence: 'presence', // where list of online users is stored in database
        sessions: 'sessions', // where list of user sessions is stored in database (presence must be enabled)
        enableLogging: false,
      }
    ),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  )(createStore)
  const store = createStoreWithMiddleware(rootReducer)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducer', () => {
      const nextRootReducer = require('./reducer')
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
