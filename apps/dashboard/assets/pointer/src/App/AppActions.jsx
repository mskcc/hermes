import axios from 'axios';

import { API_URL } from '../constants';

import {
    FETCH_USER_FULFILLED,
    FETCH_USER_ERROR,
    FETCH_PATIENT_FULFILLED,
    FETCH_PATIENT_ERROR,
    SET_INITIAL_PATIENT_DATA,
} from './AppReducer';

export function getUser(id) {
    return function (dispatch) {
        axios
            .get(API_URL + USER_ENDPOINT, {
                params: { id: id },
            })
            .then((resp) => {
                dispatch(FETCH_USER_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                dispatch(FETCH_USER_ERROR({ data: err.response.data }));
            });
    };
}

export function setInitialPatientData(patient_data) {
    return function (dispatch) {
        dispatch(SET_INITIAL_PATIENT_DATA({ data: patient_data }));
    };
}

export function getPatient(patient_id) {
    return function (dispatch) {
        axios
            .get(API_URL + PATIENT_DETAILS_ENDPOINT, {
                params: {
                    patient_id: patient_id, // todo
                },
            })
            .then((resp) => {
                dispatch(FETCH_PATIENT_FULFILLED({ data: resp.data }));
            })
            .catch((err) => {
                dispatch(FETCH_PATIENT_ERROR({ data: err.response.data }));
            });
    };
}
