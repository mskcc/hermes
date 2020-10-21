// Configuration for backend API
// Todo: have a DEV_API_URL as well
import config from './config';

const API = config.apiUrl.concat('/v0');

export const API_URL = API;
export const UNVERSIONED_API_URL = API.replace('/v0', '');

/*                */
/*    Endpoints   */
/*                */
// export const LOGIN_ENDPOINT = '/login/';
export const LOGIN_ENDPOINT = '/api-token-auth/';
export const FILES_ENDPOINT = '/fs/files/';
export const FILES_TYPES_ENDPOINT = '/fs/file-types/';
export const FILE_BATCH_PATCH_ENDPOINT = '/fs/batch-patch-files';
export const PIPELINES_ENDPOINT = '/run/pipelines';
export const RUNS_ENDPOINT = '/run/runs/';
export const PORTS_ENDPOINT = '/run/port';
export const FILES_GROUP_ENDPOINT = '/fs/file-groups/';
export const ASSAY_ENDPOINT = '/etl/assay';
export const ONCOTREE_ENDPOINT = 'http://oncotree.mskcc.org/api/tumorTypes';
/*                */
/*    Actions     */
/*                */

// App Actions
export const FETCH_USER_ERROR = 'FETCH_USER_ERROR';
export const FETCH_USER_FULFILLED = 'FETCH_USER_FULFILLED';
export const FETCH_PATIENT_ERROR = 'FETCH_PATIENT_ERROR';
export const FETCH_PATIENT_FULFILLED = 'FETCH_PATIENT_FULFILLED';
export const SET_INITIAL_PATIENT_DATA = 'SET_INITIAL_PATIENT_DATA';

export const LOGIN = 'LOGIN';
export const LOGIN_FULFILLED = 'LOGIN_FULFILLED';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGOUT = 'LOGOUT';

// Files Actions
export const FETCH_FILES_LIST = 'FETCH_FILES_LIST';
export const FILES_LIST_FULFILLED = 'FILES_LIST_FULFILLED';
export const FILES_LIST_ERROR = 'FILES_LIST_ERROR';
export const FILE_GET_FIRST = 'FILE_GET_FIRST';
export const FILE_GET_FIRST_FULFILLED = 'FILE_GET_FIRST_FULFILLED';
export const FILE_GET_FIRST_ERROR = 'FILE_GET_FIRST_ERROR';
export const FILE_GET = 'FILE_GET';
export const FILE_GET_FULFILLED = 'FILE_GET_FULFILLED';
export const FILE_GET_ERROR = 'FILE_GET_ERROR';
export const FILE_GET_TYPES = 'FILE_GET_TYPES';
export const FILE_GET_TYPES_FULFILLED = 'FILE_GET_TYPES_FULFILLED';
export const FILE_GET_TYPES_ERROR = 'FILE_GET_TYPES_ERROR';
export const UPDATE_FILE = 'UPDATE_FILE';
export const UPDATE_FILE_FULFILLED = 'UPDATE_FILE_FULFILLED';
export const UPDATE_FILE_ERROR = 'UPDATE_FILE_ERROR';

// Pipelines Actions
export const FETCH_PIPELINES = 'FETCH_PIPELINES';
export const FETCH_PIPELINES_FULFILLED = 'FETCH_PIPELINES_FULFILLED';
export const FETCH_PIPELINES_ERROR = 'FETCH_PIPELINES_ERROR';

// Runs Actions
export const FETCH_RUNS_LIST = 'FETCH_RUNS_LIST';
export const FETCH_RUNS_FULFILLED = 'FETCH_RUNS_FULFILLED';
export const FETCH_RUNS_ERROR = 'FETCH_RUNS_ERROR';
export const START_CREATE_RUN = 'START_CREATE_RUN';
export const CREATE_RUN_FULFILLED = 'CREATE_RUN_FULFILLED';
export const CREATE_RUN_ERROR = 'CREATE_RUN_ERROR';
export const FETCH_RUN = 'FETCH_RUN';
export const FETCH_RUN_FULFILLED = 'FETCH_RUN_FULFILLED';
export const FETCH_RUN_ERROR = 'FETCH_RUN_ERROR';
export const START_UPDATE_PORT = 'START_UPDATE_PORT';
export const UPDATE_PORT_FULFILLED = 'UPDATE_PORT_FULFILLED';
export const UPDATE_PORT_ERROR = 'UPDATE_PORT_ERROR';
export const UPDATE_RUN = 'UPDATE_RUN';
export const UPDATE_RUN_FULFILLED = 'UPDATE_RUN_FULFILLED';
export const UPDATE_RUN_ERROR = 'UPDATE_RUN_ERROR';

export const REQUEST_METADATA_LIST = [
    'dataAccessEmails',
    'dataAnalystEmail',
    'dataAnalystName',
    'investigatorEmail',
    'investigatorName',
    'labHeadEmail',
    'labHeadName',
    'libraryType',
    'otherContactEmails',
    'piEmail',
    'projectManagerName',
    'qcAccessEmails',
    'recipe',
    'requestId',
    'strand',
];
