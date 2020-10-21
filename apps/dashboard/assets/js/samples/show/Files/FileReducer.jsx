import { createSlice } from '@reduxjs/toolkit';

const initialFileState = {
    file: null,
    file_types: [],
    file_fetching: false,
    file_fulfilled: false,
    file_error: null,
    file_groups: null,
    file_groups_fetching: false,
    file_groups_fulfilled: false,
    file_groups_error: null,
    update_file: null,
    update_file_fetching: false,
    update_file_fulfilled: false,
    update_file_error: null,
};

function formatFileGroup(fileGroupsResponse) {
    let fileGroupsList = fileGroupsResponse['results'];
    let fileGroups = {};
    for (let singleFileGroup of fileGroupsList) {
        let singleFileGroupName = singleFileGroup['slug'];
        let singleFileGroupId = singleFileGroup['id'];
        fileGroups[singleFileGroupName] = singleFileGroupId;
    }
    return fileGroups;
}

const fileReducer = createSlice({
    name: 'fileReducer',
    initialState: initialFileState,
    reducers: {
        FILE_GET_FIRST: (state, action) => {
            state.files_fetching = true;
        },
        FILE_GET_FIRST_FULFILLED: (state, action) => {
            state.file_fetching = false;
            state.file_fulfilled = true;
            state.file = action.payload.data;
        },
        FILE_GET_FIRST_ERROR: (state, action) => {
            state.file_fetching = false;
            state.file_error = action.payload.data;
        },

        FILE_GET: (state, action) => {
            state.file_fetching = true;
        },
        FILE_GET_FULFILLED: (state, action) => {
            state.file_fetching = false;
            state.file_fulfilled = true;
            state.file = action.payload.data;
        },
        FILE_GET_ERROR: (state, action) => {
            state.files_list_fetching = false;
            state.files_list_error = action.payload.data;
        },
        FILE_GET_TYPES: (state, action) => {
            state.file_types_fetching = true;
        },
        FILE_GET_TYPES_FULFILLED: (state, action) => {
            state.file_types_fetching = false;
            state.file_types_fulfilled = true;
            state.file_types = action.payload.data;
        },
        FILE_GET_TYPES_ERROR: (state, action) => {
            state.file_types_fetching = false;
            state.file_types_error = action.payload.data;
        },
        UPDATE_FILE: (state, action) => {
            state.update_file_fetching = true;
        },
        UPDATE_FILE_FULFILLED: (state, action) => {
            state.update_file_fetching = false;
            state.update_file_fulfilled = true;
            state.update_file = action.payload;
        },
        UPDATE_FILE_ERROR: (state, action) => {
            state.update_file_fetching = false;
            state.update_file_error = action.payload.data;
        },
        FILE_GET_GROUPS: (state, action) => {
            state.file_groups_fetching = true;
        },
        FILE_GET_GROUPS_ERROR: (state, action) => {
            state.file_groups_fetching = false;
            state.file_groups_error = action.payload;
        },
        FILE_GET_GROUPS_FULFILLED: (state, action) => {
            state.file_groups_fetching = true;
            state.file_groups_fulfilled = true;
            state.file_groups = formatFileGroup(action.payload.data);
        },
    },
});

export const {
    FILE_GET_FIRST,
    FILE_GET_FIRST_FULFILLED,
    FILE_GET_FIRST_ERROR,
    FILE_GET,
    FILE_GET_FULFILLED,
    FILE_GET_ERROR,
    FILE_GET_TYPES,
    FILE_GET_TYPES_FULFILLED,
    FILE_GET_TYPES_ERROR,
    UPDATE_FILE,
    UPDATE_FILE_FULFILLED,
    UPDATE_FILE_ERROR,
    FILE_GET_GROUPS,
    FILE_GET_GROUPS_ERROR,
    FILE_GET_GROUPS_FULFILLED,
} = fileReducer.actions;
export default fileReducer.reducer;
