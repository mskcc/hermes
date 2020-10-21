import config from 'config';
import { authHeader, handleResponse } from '@/_helpers';

export const fileService = {
    getFirst,
    getPage,
    getFile,
    getFileTypes,
    getFileGroups,
    updateFile,
    getPageSearch
};


function getFirst() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var response = fetch(`${config.apiUrl}/v0/fs/files/`, requestOptions).then(handleResponse);
    return response;
}

function getFile(file_id) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var response = fetch(`${config.apiUrl}/v0/fs/files/${file_id}/`, requestOptions).then(handleResponse);
    return response;
}

function getFileTypes() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var response = fetch(`${config.apiUrl}/v0/fs/file-types/`, requestOptions).then(handleResponse);
    return response;
}

function parseFileGroups(fileGroups) {
    var fileGroupsList=fileGroups['results']
    var fileGroups = {}
    for(var singleFileGroup of fileGroupsList){
        const singleFileGroupName = singleFileGroup['slug']
        const singleFileGroupId = singleFileGroup['id']
        fileGroups[singleFileGroupName] = singleFileGroupId
    }
    return fileGroups

}

function getFileGroups() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var fileGroupsResponse = fetch(`${config.apiUrl}/v0/fs/file-groups/`, requestOptions).then(handleResponse).then(parseFileGroups);
    return fileGroupsResponse

}

function updateFile(file_id, path, size, file_type, metadata) {
    const requestOptions = { method: 'PUT',
                             headers: authHeader(),
                             body: JSON.stringify({ path, size, file_type, metadata })
                            };
    var response = fetch(`${config.apiUrl}/v0/fs/files/${file_id}/`, requestOptions).then(handleResponse);
    return response;
}

function parseResponse(files) {
    const results = {}
    results['count'] = files.count
    results['next'] = files.next
    results['previous'] = files.previous
    results['results'] = []
    files.results.forEach(function (item, index) {
        const file = {}
        file['id'] = item.id
        file['file_name'] = item.file_name
        file['size'] = item.size
        file['file_group'] = item.file_group.name
        file['sample_id'] = item.metadata.igoSampleId
        file['request_id'] = item.metadata.requestId
        results['results'].push(file)
    });
    return results;
}

function getPage(page) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var response = fetch(`${config.apiUrl}/v0/fs/files/?page=${page}`, requestOptions).then(handleResponse).then(parseResponse)
    return response;
}

function getPageSearch(page, fileGroup, fileType, metadata, fileName, fileNameRegex, valuesMetadata, metadataDistribution, count) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var queryParams = "?"
    if (fileGroup != null && fileGroup != '') {
        queryParams += `&file_group=${fileGroup}`;
    }
    if (fileType != null && fileType != '') {
        queryParams += `&file_type=${fileType}`;
    }
    if (fileName != null && fileName != '') {
        queryParams += `&filename=${fileName}`;
    }
    if (fileNameRegex != null && fileNameRegex != '') {
        queryParams += `&filename_regex=${fileNameRegex}`;
    }
    if (Array.isArray(metadata) && metadata.length) {
        for (const singleMetadata of metadata) {
            queryParams += `&metadata=${singleMetadata}`
        }
    }
    if (Array.isArray(valuesMetadata) && valuesMetadata.length) {
        for (const singleMetadata of valuesMetadata) {
            queryParams += `&values_metadata=${singleMetadata}`
        }
    }
    if (metadataDistribution != null && metadataDistribution != '') {
        queryParams += `&metadata_distribution=${metadataDistribution}`;
        var response = fetch(`${config.apiUrl}/v0/fs/files/${queryParams}`, requestOptions).then(handleResponse)
        return response;
    }
    if (count != null && count != '') {
        queryParams += '&count=true'
        console.log(queryParams)
        var response = fetch(`${config.apiUrl}/v0/fs/files/${queryParams}`, requestOptions).then(handleResponse)
        return response;
    }
    var response = fetch(`${config.apiUrl}/v0/fs/files/?page=${page}${queryParams}`, requestOptions).then(handleResponse).then(parseResponse)
    return response;
}