// send logout action

import { createSlice } from '@reduxjs/toolkit';

const initialLogoutState = {
    logout_initiated: null,
    logout_fulfilled: false,
    logout_error: null,
};

const logoutReducer = createSlice({
    name: 'logoutReducer',
    initialState: initialLogoutState,
    reducers: {
        LOGOUT: (state, action) => {
            state.logout_initiated = true;
        },
        LOGOUT_FULFILLED: (state, action) => {
            state.logout_fulfilled = true;
        },
        LOGOUT_ERROR: (state, action) => {
            state.logout_error = action.payload.data;
        },
    },
});

export const { LOGOUT, LOGOUT_FULFILLED, LOGOUT_ERROR } = logoutReducer.actions;
export default logoutReducer.reducer;
