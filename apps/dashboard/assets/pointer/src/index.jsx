import React from 'react';
import AppContainer from '@/App/App';
import { render } from 'react-dom';
import store from '@/App/store.js';
import { Provider } from 'react-redux';

render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById('app')
);
