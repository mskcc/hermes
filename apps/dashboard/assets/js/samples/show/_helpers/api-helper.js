import { SERVER_DOWN } from '../UserMessages';
// Helper functions for api calls
export function handleError(err) {
    let data = {};
    let status = null;
    if (!err.response) {
        data = {
            detail: SERVER_DOWN,
        };
        status = 503;
    } else {
        data = err.response.data;
        status = err.response.status;
    }
    return { data: data, status: status };
}

export function handleSingleParam(params, name, value) {
    if (value != null && value !== '') {
        params[name] = decodeURI(value);
    }
}

export function handleSingleBoolParam(params, name, value) {
    if (
        value != null &&
        value !== '' &&
        value !== false &&
        value.toString().toLowerCase() !== 'false'
    ) {
        params[name] = true;
    }
}

export function handleArrayParam(params, name, valueList) {
    if (Array.isArray(valueList) && valueList.length) {
        params[name] = [];
        for (const singleValue of valueList) {
            params[name].push(singleValue);
        }
    }
}
