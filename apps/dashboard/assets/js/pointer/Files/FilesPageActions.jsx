import axios from 'axios';

import { API_URL, FILES_ENDPOINT } from '../constants';
import { SERVER_DOWN } from '../UserMessages';
import { FETCH_FILES_LIST, FILES_LIST_FULFILLED, FILES_LIST_ERROR } from './FilesPageReducer';

import {
    authHeader,
    handleError,
    handleSingleParam,
    handleSingleBoolParam,
    handleArrayParam,
} from '@/_helpers';

import qs from 'qs';

export function loadFilesList({
    page = null,
    page_size = null,
    file_group = [],
    path = [],
    metadata = [],
    metadata_regex = [],
    path_regex = null,
    filename = [],
    filename_regex = null,
    file_type = [],
    values_metadata = [],
    metadata_distribution = null,
    count = false,
    created_date_timedelta = null,
    created_date_gt = null,
    created_date_lt = null,
    modified_date_timedelta = null,
    modified_date_gt = null,
    modified_date_lt = null,
    state_key,
} = {}) {
    return function (dispatch) {
        dispatch(FETCH_FILES_LIST({ state_key: state_key }));

        let params = {};
        handleSingleParam(params, 'page', page);
        handleSingleParam(params, 'page_size', page_size);
        handleArrayParam(params, 'file_group', file_group);
        handleArrayParam(params, 'path', path);
        handleArrayParam(params, 'metadata', metadata);
        handleArrayParam(params, 'metadata_regex', metadata_regex);
        handleSingleParam(params, 'path_regex', path_regex);
        handleArrayParam(params, 'filename', filename);
        handleSingleParam(params, 'filename_regex', filename_regex);
        handleArrayParam(params, 'file_type', file_type);
        handleArrayParam(params, 'values_metadata', values_metadata);
        handleSingleParam(params, 'metadata_distribution', metadata_distribution);
        handleSingleBoolParam(params, 'count', count);
        handleSingleParam(params, 'created_date_timedelta', created_date_timedelta);
        handleSingleParam(params, 'created_date_gt', created_date_gt);
        handleSingleParam(params, 'created_date_lt', created_date_lt);
        handleSingleParam(params, 'modified_date_timedelta', modified_date_timedelta);
        handleSingleParam(params, 'modified_date_gt', modified_date_gt);
        handleSingleParam(params, 'modified_date_lt', modified_date_lt);

        return axios
            .get(API_URL + FILES_ENDPOINT, {
                params: params,
                paramsSerializer: function (params) {
                    return qs.stringify(params, { arrayFormat: 'repeat' });
                },
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FILES_LIST_FULFILLED({ data: resp.data, state_key: state_key }));
            })
            .catch((err) => {
                const { data, status } = handleError(err);
                dispatch(
                    FILES_LIST_ERROR({
                        data: data,
                        status: status,
                        state_key: state_key,
                    })
                );
            });
    };
}
