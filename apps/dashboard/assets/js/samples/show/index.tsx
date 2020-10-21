import * as React from "react";
import * as ReactDOM from "react-dom";
import store from './store.js';
import { Provider } from 'react-redux';

import MetadataPage from "./MetadataPage.jsx";


ReactDOM.render(
    <Provider store={store}>
        <MetadataPage compiler="TypeScript" framework="React" />,
    </Provider>,
    document.getElementById("metadata-editor")
);

