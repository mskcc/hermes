const fetching_suffix = '_fetching';
const fulfilled_suffix = '_fulfilled';
const error_suffix = '_error';

export function setupInitialState(initalValues) {
    let initialState = {};
    for (const [singleKey, singleValue] of Object.entries(initalValues)) {
        const fetching_key = singleKey + fetching_suffix;
        const fulfilled_key = singleKey + fulfilled_suffix;
        const error_key = singleKey + error_suffix;
        initialState[singleKey] = singleValue;
        initialState[fetching_key] = false;
        initialState[fulfilled_key] = false;
        initialState[error_key] = null;
    }
    return initialState;
}

export function getInitialValue(initalValues, action) {
    return initalValues[action.payload.state_key];
}

export function getStateKeys(action) {
    let fetching = action.payload.state_key.concat('_fetching');
    let fulfilled = action.payload.state_key.concat('_fulfilled');
    let error = action.payload.state_key.concat('_error');
    let state_key = action.payload.state_key;

    return { fetching, fulfilled, error, state_key };
}
