import axios from 'axios';

import { API_URL, RUNS_ENDPOINT, PORTS_ENDPOINT } from '../constants';
import {
    FETCH_RUNS_LIST,
    RUNS_LIST_FULFILLED,
    RUNS_LIST_ERROR,
    START_CREATE_RUN,
    CREATE_RUN_FULFILLED,
    CREATE_RUN_ERROR,
    START_UPDATE_PORT,
    UPDATE_PORT_FULFILLED,
    UPDATE_PORT_ERROR,
    UPDATE_RUN,
    UPDATE_RUN_FULFILLED,
    UPDATE_RUN_ERROR,
} from './RunsPageReducer';

import {
    authHeader,
    handleError,
    handleSingleParam,
    handleSingleBoolParam,
    handleArrayParam,
} from '@/_helpers';

import qs from 'qs';

export function createRun(pipeline_id, request_id) {
    return function (dispatch) {
        dispatch(START_CREATE_RUN());

        return axios(API_URL + RUNS_ENDPOINT, {
            method: 'post',
            headers: authHeader(),
            data: {
                pipeline_id: pipeline_id,
                request_id: request_id,
            },
        })
            .then((resp) => {
                dispatch(CREATE_RUN_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                const { data, status } = handleError(err);
                dispatch(
                    CREATE_RUN_ERROR({
                        data: data,
                        status: status,
                    })
                );
            });
    };
}

export function updatePorts(run_id, inputs, status) {
    return function (dispatch) {
        for (const key in inputs) {
            dispatch(START_UPDATE_PORT());

            axios
                .put(API_URL + PORTS_ENDPOINT, {
                    params: {
                        run_ids: handleArrayParam(run_id),
                    },
                    headers: authHeader(),
                    body: JSON.stringify({ values: inputs[key] }),
                })
                .then((resp) => {
                    dispatch(UPDATE_PORT_FULFILLED({ data: resp.data }));
                    // Need to automatically update runs after updating ports
                    // Todo: why?
                    dispatch(
                        UPDATE_RUN({
                            id: run_id,
                            data: resp.data,
                        })
                    );
                })
                .catch((err) => {
                    const { data, status } = handleError(err);
                    dispatch(
                        UPDATE_PORT_ERROR({
                            data: data,
                            status: status,
                        })
                    );
                });
        }
    };
}

export function updateRun(id, status) {
    return function (dispatch) {
        return axios
            .put(API_URL + RUNS_ENDPOINT + '/${id}', {
                params: {
                    run_ids: handleArrayParam(id),
                },
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(UPDATE_RUN_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                const { data, status } = handleError(err);
                dispatch(
                    UPDATE_RUN_ERROR({
                        data: data,
                        status: status,
                    })
                );
            });
    };
}

export function loadRunsList({
    page = null,
    page_size = null,
    status = null,
    job_groups = [],
    apps = [],
    ports = [],
    tags = [],
    request_ids = [],
    jira_ids = [],
    run_ids = [],
    values_run = [],
    run_distribution = null,
    run = [],
    full = false,
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
        dispatch(FETCH_RUNS_LIST({ state_key: state_key }));

        let params = {};
        handleSingleParam(params, 'page', page);
        handleSingleParam(params, 'page_size', page_size);
        handleSingleParam(params, 'status', status);
        handleArrayParam(params, 'job_groups', job_groups);
        handleArrayParam(params, 'apps', apps);
        handleArrayParam(params, 'ports', ports);
        handleArrayParam(params, 'tags', tags);
        handleArrayParam(params, 'request_ids', request_ids);
        handleArrayParam(params, 'jira_ids', jira_ids);
        handleArrayParam(params, 'run_ids', run_ids);
        handleArrayParam(params, 'values_run', values_run);
        handleSingleParam(params, 'run_distribution', run_distribution);
        handleArrayParam(params, 'run', run);
        handleSingleBoolParam(params, 'full', full);
        handleSingleBoolParam(params, 'count', count);
        handleSingleParam(params, 'created_date_timedelta', created_date_timedelta);
        handleSingleParam(params, 'created_date_gt', created_date_gt);
        handleSingleParam(params, 'created_date_lt', created_date_lt);
        handleSingleParam(params, 'modified_date_timedelta', modified_date_timedelta);
        handleSingleParam(params, 'modified_date_gt', modified_date_gt);
        handleSingleParam(params, 'modified_date_lt', modified_date_lt);

        return axios
            .get(API_URL + RUNS_ENDPOINT, {
                params: params,
                paramsSerializer: function (params) {
                    return qs.stringify(params, { arrayFormat: 'repeat' });
                },
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(RUNS_LIST_FULFILLED({ data: resp.data, state_key: state_key }));
            })
            .catch((err) => {
                const { data, status } = handleError(err);
                dispatch(
                    RUNS_LIST_ERROR({
                        data: data,
                        status: status,
                        state_key: state_key,
                    })
                );
            });
    };
}
