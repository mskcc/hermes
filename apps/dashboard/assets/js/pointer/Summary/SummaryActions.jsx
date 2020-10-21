import axios from 'axios';
import { authHeader } from '@/_helpers';

import { API_URL, ASSAY_ENDPOINT, ONCOTREE_ENDPOINT } from '../constants';
import { SERVER_DOWN } from '../UserMessages';
import {
    FETCH_ASSAY,
    FETCH_ASSAY_ERROR,
    FETCH_ASSAY_FULFILLED,
    FETCH_ONCOTREE,
    FETCH_ONCOTREE_ERROR,
    FETCH_ONCOTREE_FULFILLED,
} from './SummaryReducer';

function buildMetaDataQuery(key, valueList) {
    var queryList = [];
    for (const singleValue of valueList) {
        const singleQuery = key + ':' + singleValue;
        queryList.push(singleQuery);
    }
    return queryList;
}

export function getAssay() {
    return function (dispatch) {
        dispatch(FETCH_ASSAY());
        return axios
            .get(API_URL + ASSAY_ENDPOINT, {
                headers: authHeader(),
            })
            .then((resp) => {
                dispatch(FETCH_ASSAY_FULFILLED({ data: resp.data }));
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
                dispatch(FETCH_ASSAY_ERROR({ data: data, status: status }));
            });
    };
}

export function getOncoTree() {
    return function (dispatch) {
        dispatch(FETCH_ONCOTREE());
        return axios
            .get(ONCOTREE_ENDPOINT, {})
            .then((resp) => {
                dispatch(FETCH_ONCOTREE_FULFILLED({ data: resp.data }));
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
                dispatch(FETCH_ONCOTREE_ERROR({ data: data, status: status }));
            });
    };
}
