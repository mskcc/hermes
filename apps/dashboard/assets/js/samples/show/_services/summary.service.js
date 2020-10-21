import config from 'config';
import { authHeader, handleResponse } from '@/_helpers';
import { fileService } from '@/_services';

export const summaryService = {
    getSummaryInfo,
    handleGetSummaryInfo
};

async function getCountByMetadata(fileGroup,metadataIdList,valuesMetadata, metadataDistribution, count) {
    var fileGroups = await fileService.getFileGroups()
    var fileGroupId = fileGroups[fileGroup]
    console.log(fileGroupId)
    return fileService.getPageSearch(null,fileGroupId, null, metadataIdList, null, null, valuesMetadata, metadataDistribution, count)
}

function getLIMSRequest() {
    var file_groups = fileService.getFileGroups()
    LIMS_file_group = file_groups['lims']
    return fileService.getPageSearch(null,LIMS_file_group, null, null, null, null, 'sampleId', true)
}

function parseAssay(assayResponse) {
    return assayResponse
}

async function getAssays() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    var response = await fetch(`${config.apiUrl}/v0/etl/assay`, requestOptions);
    var responseJson = await response.json()
    return responseJson;
}

function buildMetaDataQuery(key,valueList){
    var queryList = []
    for (const singleValue of valueList){
        const singleQuery = key +':' + singleValue
        queryList.push(singleQuery)
    }
    return queryList
}

function handleGetSummaryInfo() {
    return getSummaryInfo().then(
        function(x) {
            console.log(x);
            return x
        }
        )
}

async function getSummaryInfo() {
    var summaryInfo = {}
    summaryInfo['numRequests'] = await getCountByMetadata('lims',null,['requestId'],null,true)
    summaryInfo['numSamples'] = await getCountByMetadata('lims',null,['sampleId'],null,true)
    summaryInfo['numPooledNormals'] = await getCountByMetadata('pooled-normals',null,['runId','recipe','preservation'],null,true)
    summaryInfo['numDmpBams'] = await getCountByMetadata('dmp-bams',null,null,null,true)
    var assays = await getAssays()
    var nonArgosAssay = assays['disabled'].concat(assays['hold'])
    var argosAssay = assays['all'].filter(function(x) {
        return nonArgosAssay.indexOf(x) < 0;
    })
    const argos_request_query = buildMetaDataQuery('recipe',argosAssay)
    summaryInfo['argosRequests'] = await getCountByMetadata('lims',argos_request_query,['requestId'],null,true)
    summaryInfo['argosSamples'] = await getCountByMetadata('lims',argos_request_query,['sampleId'],null,true)
    return summaryInfo
}