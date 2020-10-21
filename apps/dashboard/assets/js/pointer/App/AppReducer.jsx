import { createSlice } from '@reduxjs/toolkit';

const initialAppState = {
    user: null,
    patient: null,
    user_fetching: false,
    user_fetched: false,
    user_error: null,
    initial_patient_data: null,
};

const appReducer = createSlice({
    name: 'appReducer',
    initialState: initialAppState,
    reducers: {
        FETCH_USER_ERROR: (state, action) => {
            state.user_fetching = false;
            state.user_fetch_error = action.payload.data;
        },
        FETCH_USER_FULFILLED: (state, action) => {
            state.user_fetching = false;
            state.user_fetched = true;
            state.user = action.payload.data;
        },
        FETCH_PATIENT_ERROR: (state, action) => {
            state.patient_fetching = false;
            state.patient_fetch_error = action.payload.data;
        },
        FETCH_PATIENT_FULFILLED: (state, action) => {
            state.patient_fetching = false;
            state.patient_fetched = true;
            state.patient = action.payload.data;
        },
        SET_INITIAL_PATIENT_DATA: (state, action) => {
            state.initial_patient_data = action.payload.data;
        },
        LOGOUT: (state, action) => {
            state.user = null;
            state.patient = null;
        },
    },
});

export const {
    FETCH_USER_ERROR,
    FETCH_USER_FULFILLED,
    FETCH_PATIENT_ERROR,
    FETCH_PATIENT_FULFILLED,
    SET_INITIAL_PATIENT_DATA,
    LOGOUT,
} = appReducer.actions;
export default appReducer.reducer;
