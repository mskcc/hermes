import { createSlice } from '@reduxjs/toolkit';

const initialRunPageState = {
    runs_list: null,
    runs_list_fetching: false,
    runs_list_fulfilled: false,
    runs_list_error: null,
    run_create: null,
    runs_create_starting: false,
    runs_create_fulfilled: false,
    runs_create_error: null,
    port_update: null,
    port_update_starting: false,
    port_update_fulfilled: false,
    port_update_error: null,
    run_update: null,
    run_update_starting: false,
    run_update_fulfilled: false,
    run_update_error: null,
};

function getStateKeys(action) {
    let fetching = action.payload.state_key.concat('_fetching');
    let fulfilled = action.payload.state_key.concat('_fulfilled');
    let error = action.payload.state_key.concat('_error');
    let state_key = action.payload.state_key;

    return { fetching, fulfilled, error, state_key };
}

const runPageReducer = createSlice({
    name: 'runPageReducer',
    initialState: initialRunPageState,
    reducers: {
        FETCH_RUNS_LIST: (state, action) => {
            let stateKeys = getStateKeys(action);
            state[stateKeys.fetching] = true;
        },
        RUNS_LIST_FULFILLED: (state, action) => {
            let stateKeys = getStateKeys(action);
            state[stateKeys.fetching] = false;
            state[stateKeys.fulfilled] = true;
            state[stateKeys.state_key] = action.payload.data;
        },
        RUNS_LIST_ERROR: (state, action) => {
            let stateKeys = getStateKeys(action);
            state[stateKeys.fetching] = false;
            state[stateKeys.error] = action.payload.data;
        },
        START_CREATE_RUN: (state, action) => {
            state.runs_create_starting = true;
        },
        CREATE_RUN_FULFILLED: (state, action) => {
            state.run_create_starting = false;
            state.run_create_fulfilled = true;
            state.run_create = action.payload.data;
        },
        CREATE_RUN_ERROR: (state, action) => {
            state.run_create_starting = false;
            state.run_create_error = action.payload.data;
        },
        START_UPDATE_PORT: (state, action) => {
            state.port_update_starting = true;
        },
        UPDATE_PORT_FULFILLED: (state, action) => {
            state.port_update_starting = false;
            state.port_update_fulfilled = true;
            state.port_update = action.payload.data;
        },
        UPDATE_PORT_ERROR: (state, action) => {
            state.port_update_starting = false;
            state.port_update_error = action.payload.data;
        },
        UPDATE_RUN: (state, action) => {
            state.run_update_starting = true;
        },
        UPDATE_RUN_FULFILLED: (state, action) => {
            state.run_update_starting = false;
            state.run_update_fulfilled = true;
            state.run_update = action.payload.data;
        },
        UPDATE_RUN_ERROR: (state, action) => {
            state.run_update_starting = true;
            state.run_update_error = action.payload.data;
        },
    },
});

export const {
    FETCH_RUNS_LIST,
    RUNS_LIST_FULFILLED,
    RUNS_LIST_ERROR,
    START_CREATE_RUN,
    CREATE_RUN_FULFILLED,
    CREATE_RUN_ERROR,
    FETCH_RUN,
    FETCH_RUN_FULFILLED,
    FETCH_RUN_ERROR,
    START_UPDATE_PORT,
    UPDATE_PORT_FULFILLED,
    UPDATE_PORT_ERROR,
    UPDATE_RUN,
    UPDATE_RUN_FULFILLED,
    UPDATE_RUN_ERROR,
} = runPageReducer.actions;
export default runPageReducer.reducer;
