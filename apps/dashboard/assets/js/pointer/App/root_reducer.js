import { combineReducers } from 'redux';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

import appReducer from './AppReducer';
import loginReducer from '../LoginPage/LoginReducer';
import fileReducer from '../Files/FileReducer';
import filesPageReducer from '../Files/FilesPageReducer';
import pipelinePageReducer from '../PipelinePage/PipelinePageReducer';
import runsPageReducer from '../Run/RunsPageReducer';
import summaryReducer from '../Summary/SummaryReducer';
import metadataReducer from '../Metadata/MetadataReducer';

export default combineReducers({
    appReducer,
    loginReducer,
    fileReducer,
    filesPageReducer,
    pipelinePageReducer,
    runsPageReducer,
    summaryReducer,
    metadataReducer,
    routing: routerReducer,
});
