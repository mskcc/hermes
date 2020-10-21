import { createStore, applyMiddleware, compose } from 'redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware, push } from 'react-router-redux';

import { logger } from 'redux-logger';
import promise from 'redux-promise-middleware';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import reducer from './root_reducer.js';
//import { LOGIN_ERROR } from '@/LoginPage/LoginReducer';
import { history } from './_helpers';
import { currentUserSubject } from './_services';

const routeMiddleware = routerMiddleware(browserHistory);

const authInterceptor = ({ dispatch }) => (next) => (action) => {
    let status = null;
    if (action.payload && 'status' in action.payload) {
        status = action.payload.status;
    }
    if (status === 401 || status === 403) {
    /*
        if (action.type != String(LOGIN_ERROR)) {
            localStorage.removeItem('currentUser');
            currentUserSubject.next(null);
            history.push(`/login`);
        } else {
            next(action);
        }
        // dispatch(actions.removeJwt());
    */
    } else {
        next(action);
    }
};

const middleware = [...getDefaultMiddleware(), logger, routeMiddleware, authInterceptor];

const store = configureStore({
    reducer: reducer,
    middleware: middleware,
});

export default store;
