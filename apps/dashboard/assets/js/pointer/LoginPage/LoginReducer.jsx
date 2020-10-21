import { createSlice } from '@reduxjs/toolkit';

const initialLoginState = {
    current_user: null,
    current_user_fetching: false,
    current_user_fulfilled: false,
    current_user_error: null,
};

const loginReducer = createSlice({
    name: 'loginReducer',
    initialState: initialLoginState,
    reducers: {
        LOGIN: (state, action) => {
            state.current_user = true;
        },
        LOGIN_FULFILLED: (state, action) => {
            state.current_user_fetching = false;
            state.current_user_fulfilled = true;
            state.current_user_error = null;
            state.current_user = action.payload.data;
        },
        LOGIN_ERROR: (state, action) => {
            state.current_user = null;
            state.current_user_fetching = false;
            state.current_user_error = action.payload.data;
        },
    },
});

export const { LOGIN, LOGIN_FULFILLED, LOGIN_ERROR } = loginReducer.actions;
export default loginReducer.reducer;
