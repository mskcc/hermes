import config from 'config';
import { authHeader, handleResponse } from '@/_helpers';

export const runService = {
    // getRun,
    // createRun,
    // updatePorts,
    // updateRun
};

function createRun(pipeline_id) {
    const requestOptions = { method: 'POST',
                             headers: authHeader(),
                             body: JSON.stringify({ pipeline_id })
                           };
    return fetch(`${config.apiUrl}/v0/run/runs/`, requestOptions).then(handleResponse);
}

function getRun(run_id) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${config.apiUrl}/v0/run/runs/${run_id}/`, requestOptions).then(handleResponse);
}

function updatePorts(id, inputs, status) {
    for (var key in inputs) {
        const requestOptions = { method: 'PUT',
                             headers: authHeader(),
                             body: JSON.stringify({values: inputs[key]})
                            };
        fetch(`${config.apiUrl}/v0/run/port/${key}/`, requestOptions).then(handleResponse);
    }
    return updateRun(id, status);
}

function updateRun(id, status) {
    const requestOptions = { method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({status})
    };
    return fetch(`${config.apiUrl}/v0/run/runs/${id}/`, requestOptions).then(handleResponse);

}
