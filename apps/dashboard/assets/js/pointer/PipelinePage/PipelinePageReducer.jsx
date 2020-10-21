import { createSlice } from '@reduxjs/toolkit';

const initialPipelinePageState = {
    pipelines: null,
};

const pipelinePageReducer = createSlice({
    name: 'pipelinePageReducer',
    initialState: initialPipelinePageState,
    reducers: {
        FETCH_PIPELINES: (state, action) => {
            state.pipelines_fetching = true;
            state.pipelines_fetch_error = null;
        },
        FETCH_PIPELINES_FULFILLED: (state, action) => {
            state.pipelines_fetching = false;
            state.pipelines = action.payload.data;
        },
        FETCH_PIPELINES_ERROR: (state, action) => {
            state.pipelines_fetching = false;
            state.pipelines_fetch_error = action.payload.data;
        },
    },
});

export const {
    FETCH_PIPELINES,
    FETCH_PIPELINES_FULFILLED,
    FETCH_PIPELINES_ERROR,
} = pipelinePageReducer.actions;
export default pipelinePageReducer.reducer;
