import { authHeader } from '@/_helpers';

import axios from 'axios';

import { API_URL, FILES_ENDPOINT, FILES_TYPES_ENDPOINT, FILES_GROUP_ENDPOINT } from '../constants';

import { SERVER_DOWN } from '../UserMessages';

import {
    FILE_GET_FIRST,
    FILE_GET_FIRST_FULFILLED,
    FILE_GET_FIRST_ERROR,
    FILE_GET,
    FILE_GET_FULFILLED,
    FILE_GET_ERROR,
    FILE_GET_TYPES,
    FILE_GET_TYPES_FULFILLED,
    FILE_GET_TYPES_ERROR,
    UPDATE_FILE,
    UPDATE_FILE_FULFILLED,
    UPDATE_FILE_ERROR,
    FILE_GET_GROUPS,
    FILE_GET_GROUPS_ERROR,
    FILE_GET_GROUPS_FULFILLED,
} from './FileReducer';

export function getFirstFile() {
    return function (dispatch) {
        dispatch({ type: FILE_GET_FIRST });
        axios
            .get(API_URL + FILES_ENDPOINT, {
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FILE_GET_FIRST_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                let data = {};
                let status = null;
                if (!err.response) {
                    data = {
                        detail: SERVER_DOWN,
                    };
                    status = 503;
                } else {
                    data = err.response.data;
                    status = err.response.status;
                }
                dispatch(FILE_GET_FIRST_ERROR({ data: data, status: status }));
            });
    };
}

export function getFile(file_id) {
    return function (dispatch) {
        dispatch({ type: FILE_GET });
        axios
            .get(API_URL + FILES_ENDPOINT + file_id, {
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FILE_GET_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                let data = {};
                let status = null;
                if (!err.response) {
                    data = {
                        detail: SERVER_DOWN,
                    };
                    status = 503;
                } else {
                    data = err.response.data;
                    status = err.response.status;
                }
                dispatch(FILE_GET_ERROR({ data: data, status: status }));
            });
    };
}

export function getFileTypes(page) {
    return function (dispatch) {
        dispatch(FILE_GET_TYPES());
        axios
            .get(API_URL + FILES_TYPES_ENDPOINT, {
                params: {},
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FILE_GET_TYPES_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                let data = {};
                let status = null;
                if (!err.response) {
                    data = {
                        detail: SERVER_DOWN,
                    };
                    status = 503;
                } else {
                    data = err.response.data;
                    status = err.response.status;
                }
                dispatch(FILE_GET_TYPES_ERROR({ data: data, status: status }));
            });
    };
}

export function getFileGroups() {
    return function (dispatch) {
        dispatch(FILE_GET_GROUPS());
        return axios
            .get(API_URL + FILES_GROUP_ENDPOINT, {
                params: {},
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FILE_GET_GROUPS_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                let data = {};
                let status = null;
                if (!err.response) {
                    data = {
                        detail: SERVER_DOWN,
                    };
                    status = 503;
                } else {
                    data = data;
                    status = status;
                }
                dispatch(FILE_GET_GROUPS_ERROR({ data: data, status: status }));
            });
    };
}

export function updateFile(id, path, size, file_type, metadata) {
    return function (dispatch) {
        dispatch({ type: UPDATE_FILE });
        axios
            .put(API_URL + FILES_ENDPOINT, {
                params: {
                    file_id: id,
                },
                headers: authHeader(),
                data: JSON.stringify({ path, size, file_type, metadata }),
            })
            .then((resp) => {
                dispatch(UPDATE_FILE_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                let data = {};
                let status = null;
                if (!err.response) {
                    data = {
                        detail: SERVER_DOWN,
                    };
                    status = 503;
                } else {
                    data = err.response.data;
                    status = err.response.status;
                }
                dispatch(UPDATE_FILE_ERROR({ data: data, status: status }));
            });
    };
}
