import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
import thunkMiddleware from 'redux-thunk';

import promiseMiddleware from '../middlewares/promiseMiddleware';
import rootReducer from '../reducers';

const initialState = {};
// for redux-tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const createStoreWithMiddleware = composeEnhancers(applyMiddleware(
	thunkMiddleware,
	promiseMiddleware({ promiseTypeSuffixes: ['PENDING', 'SUCCESS', 'ERROR'] })
))(createStore);

const store = createStoreWithMiddleware(rootReducer, initialState);

export const history = syncHistoryWithStore(browserHistory, store);

export default store;