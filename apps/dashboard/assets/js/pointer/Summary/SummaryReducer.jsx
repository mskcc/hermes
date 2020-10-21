import { createSlice } from '@reduxjs/toolkit';

const initialSummaryState = {
    argosAssay: null,
    holdAssay: null,
    disabledAssay: null,
    oncoTree: null,
    assayFetching: false,
    assayFulfilled: false,
    assayError: null,
    oncoTreeFetching: false,
    oncoTreeFulfilled: false,
    oncoTreeError: null,
};

function getAssayTypes(assays) {
    let assayHold = assays['hold_recipes'];
    let assayDisabled = assays['disabled_recipes'];
    let nonArgosAssay = assayDisabled.concat(assayHold);
    let argosAssay = assays['all_recipes'].filter(function (x) {
        return nonArgosAssay.indexOf(x) < 0;
    });
    return { argosAssay, assayHold, assayDisabled };
}

function formatOncoTreeData(oncoTreeResponse) {
    const oncoTreeData = {};
    if (oncoTreeResponse) {
        for (const singleItem of oncoTreeResponse) {
            let oncoTreeCode = singleItem['code'];
            let oncoTreeColor = singleItem['color'];
            let oncoTreeTissue = singleItem['tissue'];
            oncoTreeData[oncoTreeCode] = { color: oncoTreeColor, tissue: oncoTreeTissue };
        }
    }

    return oncoTreeData;
}

const summaryReducer = createSlice({
    name: 'summaryReducer',
    initialState: initialSummaryState,
    reducers: {
        FETCH_ASSAY: (state, action) => {
            state.assayFetching = true;
        },
        FETCH_ASSAY_ERROR: (state, action) => {
            state.assayFetching = false;
            state.assayError = action.payload.data;
        },
        FETCH_ASSAY_FULFILLED: (state, action) => {
            state.assayFetching = false;
            state.assayFulfilled = true;
            let { argosAssay, assayHold, assayDisabled } = getAssayTypes(action.payload.data);
            state.argosAssay = argosAssay;
            state.holdAssay = assayHold;
            state.disabledAssay = assayDisabled;
        },
        FETCH_ONCOTREE: (state, action) => {
            state.oncoTreeFetching = true;
        },
        FETCH_ONCOTREE_ERROR: (state, action) => {
            state.oncoTreeFetching = false;
            state.oncoTreeError = action.payload.data;
        },
        FETCH_ONCOTREE_FULFILLED: (state, action) => {
            state.oncoTreeFetching = false;
            state.oncoTreeFulfilled = true;
            state.oncoTree = formatOncoTreeData(action.payload.data);
        },
    },
});

export const {
    FETCH_ASSAY,
    FETCH_ASSAY_ERROR,
    FETCH_ASSAY_FULFILLED,
    FETCH_ONCOTREE,
    FETCH_ONCOTREE_ERROR,
    FETCH_ONCOTREE_FULFILLED,
} = summaryReducer.actions;
export default summaryReducer.reducer;
