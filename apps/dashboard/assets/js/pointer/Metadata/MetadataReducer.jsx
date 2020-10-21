import { createSlice } from '@reduxjs/toolkit';

const initialMetadataState = {
    update: null,
    updateProcessing: false,
    updateError: null,
};

const metadataReducer = createSlice({
    name: 'metadataReducer',
    initialState: initialMetadataState,
    reducers: {
        PROCESS_UPDATE: (state, action) => {
            state.updateProcessing = true;
            state.updateError = null;
            state.updateFulfilled = false;
            state.update = null;
        },
        PROCESS_UPDATE_ERROR: (state, action) => {
            state.updateProcessing = false;
            state.updateError = action.payload.data;
        },
        PROCESS_UPDATE_FULFILLED: (state, action) => {
            state.updateProcessing = false;
            state.update = action.payload.data;
        },
    },
});

export const {
    PROCESS_UPDATE,
    PROCESS_UPDATE_ERROR,
    PROCESS_UPDATE_FULFILLED,
} = metadataReducer.actions;
export default metadataReducer.reducer;
