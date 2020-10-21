import axios from 'axios';
import { authHeader } from '@/_helpers';

import { API_URL, FILE_BATCH_PATCH_ENDPOINT } from '../constants';
import { SERVER_DOWN } from '../UserMessages';
import { PROCESS_UPDATE, PROCESS_UPDATE_ERROR, PROCESS_UPDATE_FULFILLED } from './MetadataReducer';

export function updateMetadata(data) {
    return function (dispatch) {
        dispatch(PROCESS_UPDATE());
        return axios
            .post(API_URL + FILE_BATCH_PATCH_ENDPOINT, data, { headers: authHeader() })
            .then((resp) => {
                dispatch(PROCESS_UPDATE_FULFILLED({ data: resp.data }));
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
                dispatch(PROCESS_UPDATE_ERROR({ data: data, status: status }));
            });
    };
}
