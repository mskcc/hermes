import axios from 'axios';

import { API_URL, PIPELINES_ENDPOINT } from '../constants';

import { SERVER_DOWN } from '../UserMessages';

import {
    FETCH_PIPELINES,
    FETCH_PIPELINES_FULFILLED,
    FETCH_PIPELINES_ERROR,
} from './PipelinePageReducer';

import { authenticationService } from '@/_services';

import { authHeader } from '@/_helpers';

export function getPage(page) {
    return function (dispatch) {
        dispatch(FETCH_PIPELINES());
        return axios
            .get(API_URL + PIPELINES_ENDPOINT, {
                params: {
                    page: unescape(page),
                },
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FETCH_PIPELINES_FULFILLED({ data: resp.data }));
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
                dispatch(
                    FETCH_PIPELINES_ERROR({
                        data: data,
                        status: status,
                    })
                );
            });
    };
}
