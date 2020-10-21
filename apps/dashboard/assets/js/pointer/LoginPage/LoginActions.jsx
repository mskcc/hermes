import axios from 'axios';

import { UNVERSIONED_API_URL, LOGIN_ENDPOINT } from '../constants';
import { SERVER_DOWN } from '../UserMessages';
import { LOGIN, LOGIN_FULFILLED, LOGIN_ERROR } from './LoginReducer';

export function login(username, password) {
    return function (dispatch) {
        dispatch(LOGIN());

        return axios
            .post(UNVERSIONED_API_URL + LOGIN_ENDPOINT, {
                username: username,
                password: password,
            })
            .then((resp) => {
                // Todo: ok to not use currentUserSubject anymore? and only localStorage?
                localStorage.setItem('currentUser', JSON.stringify(resp.data));
                resp.data.user['user'] = username;
                dispatch(LOGIN_FULFILLED({ data: resp.data }));
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
                    LOGIN_ERROR({
                        data: data,
                        status: status,
                    })
                );
            });
    };
}
