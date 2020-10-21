import config from 'config';
import { authHeader, handleResponse } from '@/_helpers';
import { saveAs } from 'file-saver';

export const pipelineService = {
    downloadCWL
};

function downloadCWL(id, entrypoint) {
    var headers = authHeader();
    headers["Content-Type"] = "text/json; charset=utf-8";
    const requestOptions = { method: 'GET', headers: authHeader() };
    fetch(`${config.apiUrl}/v0/run/pipeline/download/${id}`, requestOptions).then(response => {
        if (response.status === 200) {
            var content_disposition = response.headers.get("Content-Disposition");
            if (content_disposition != null) {
                filename = content_disposition.match(/(?<=")(?:\\.|[^"\\])*(?=")/)[0];
            }
            return response.blob();
        } else {
        return;
        }
    })
    .then(body => {
        saveAs(body, entrypoint);
    });
}
