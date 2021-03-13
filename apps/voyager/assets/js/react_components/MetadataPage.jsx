import React, { useState, useEffect } from 'react';
import { Formik, Field, getIn } from 'formik';
import * as Yup from 'yup';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import red from '@material-ui/core/colors/red';
import {
    setupDictTable,
    setupTable,
    addTableValidation,
    recordChanges,
    editObj,
    setupChangesTable,
    createYupValidation,
    deserialize,
    handlePlural,
} from '@/_helpers';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MaterialTable, { MTableEditField, MTableEditRow } from 'material-table';
import VerticalTabs from '@/_components/VerticalTabs';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import axios from 'axios';
import Skeleton from '@material-ui/lab/Skeleton';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import ButtonGroup from '@material-ui/core/ButtonGroup';

const FIELD_COLOR = '#FFF';
const HEADER_COLOR = '#FFF';
const FIELED_BACKGROUND_COLOR = 'darkslateblue';
const HEADER_BACKGROUND_COLOR = 'slategrey';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    requestTable: {
        width: '100%',
    },
    accordianDetailRoot: {
        width: '100%',
        flexDirection: 'column',
        padding: 'inherit',
    },
    changeTable: {
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
    },
    submitButton: {
        margin: '20px',
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    heading: {
        width: '100%',
    },
    progressSpinner: {
        width: '1.5rem !important',
        height: '1.5rem !important',
    },
    loadingTableHeader: {
        height: '60px',
    },
    loadingTableRow: {
        height: '50px',
    },
    changeRequestButton: {
        textTransform: 'none',
    },
    sampleIdNotSelected: {
        backgroundColor: 'white',
    },
    sampleIdSelected: {
        backgroundColor: 'cornflowerblue',
        '&:hover': {
            backgroundColor: 'cornflowerblue',
        },
    },
}));

export default function MetadataPage(props) {
    const classes = useStyles();
    const {
        metadataList,
        requestKeyList,
        metadataValidation,
        noMetadataChangesMessage,
        noQcReportDataMessage,
        qcReportField,
        sampleVerificationKeys,
        requestField,
        sampleLabelKeys,
        params,
        metadataInputRoute,
        selectedSample,
        defaultSampleIdType,
        handleEvent,
        pushEvent,
    } = props;
    const [patchReady, updatePatchReady] = useState(false);
    const [resetProcessing, updateResetProcessing] = useState(false);
    const [patchProcessing, updatePatchProcessing] = useState(false);
    const [metadata, updateMetadata] = useState(metadataList);
    const [metadataChanges, updateMetadataChanges] = useState({ request: {}, sample: {} });
    const [metadataTables, updateMetadataTables] = useState([]);
    const [requestData, updateRequestData] = useState([]);
    const [requestColumn, updateRequestColumn] = useState([]);
    const [requestTitleToField, updateRequestTitleToField] = useState({});
    const [sampleList, updateSampleList] = useState([]);
    const [sampleFiles, updateSampleFiles] = useState({});
    const [sampleIndex, updateSampleIndex] = useState(0);
    const [sampleInfoType, updateSampleInfoType] = useState(0);
    const [sampleIdMetadataKey, updateSampleIdMetadataKey] = useState(defaultSampleIdType);
    const [sampleHeader, updateSampleHeader] = useState('loading...');
    const [sampleHeaderLabel, updateSampleHeaderLabel] = useState('Sample');
    const [editHeaderLabel, updateEditHeaderLabel] = useState('0 Edits');
    const [editHeaderSampleLabel, updateEditHeaderSampleLabel] = useState('');
    const [editHeaderRequestLabel, updateEditHeaderRequestLabel] = useState('');
    const [requestHeader, updateRequestHeader] = useState('loading...');
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    const stateInfo = {
        stateMetadata: metadata,
        stateMetadataChanges: metadataChanges,
        stateSampleList: sampleList,
        stateSampleFiles: sampleFiles,
        stateSampleIndex: sampleIndex,
        stateSampleInfoType: sampleInfoType,
        stateSampleIdMetadataKey: sampleIdMetadataKey,
    };

    const loadingRequestWidth = [1, 2, 4, 2, 3, 1, 2, 4, 2, 3, 1, 2, 4, 2, 3];
    const loadingSampleTableWidth = [1, 5, 6, 1, 5, 6, 1, 5, 6];
    const loadingSampleListWidth = [11, 11, 11, 11, 11, 11];

    const setUp = () => {
        if (sampleList.length !== 0) {
            setUpSampleList(sampleList[sampleIndex]['id'], metadataChanges, sampleIdMetadataKey);
        } else {
            updateSampleIdMetadataKey(defaultSampleIdType);
            setUpSampleList(selectedSample, metadataChanges, defaultSampleIdType);
        }
        setUpRequestTable();
    };

    const handleSampleChange = (event, newValue) => {
        updateSampleIndex(newValue);
        updateSampleHeader(sampleList[newValue]['label']);
    };

    const handleInfoTypeChange = (event, newValue) => {
        updateSampleInfoType(newValue);
    };

    const handleSampleSearchChange = (value) => {
        sessionStorage.setItem('sampleSearch', value);
    };

    const getSampleName = (fileId, sampleListParam, sampleFilesParam) => {
        const sampleId = sampleFilesParam[fileId];
        for (const singleSample of sampleListParam) {
            if (singleSample['id'] === sampleId) {
                return singleSample['label'];
            }
        }

        return '[EMPTY]';
    };

    const renderMetaDataChanges = (metadataChangesParam, sampleListParam, sampleFilesParam) => {
        let metadataTables = [];
        const requestKeys = Object.keys(metadataChangesParam['request']);
        const sampleKeys = Object.keys(metadataChangesParam['sample']);
        const requestChanges = requestKeys.length;
        let sampleChanges = 0;
        if (requestChanges !== 0) {
            for (const singleField of requestKeys) {
                if (singleField === requestField) {
                    checkRequestHeader(metadataChangesParam['request'][singleField]['current']);
                }
            }
            const { data, column } = setupChangesTable(metadataChangesParam['request']);
            const title = 'Request';
            metadataTables.push({ data: data, column: column, title: title });
        }

        if (sampleKeys.length !== 0) {
            for (const singleSampleId of sampleKeys) {
                const sampleChangeKeys = Object.keys(
                    metadataChangesParam['sample'][singleSampleId]
                );
                if (sampleChangeKeys.length !== 0) {
                    const { data, column } = setupChangesTable(
                        metadataChangesParam['sample'][singleSampleId]
                    );
                    const singleSampleName = getSampleName(
                        singleSampleId,
                        sampleListParam,
                        sampleFilesParam
                    );
                    const title = 'Sample: ' + singleSampleName;
                    metadataTables.push({ data: data, column: column, title: title });
                    sampleChanges += sampleChangeKeys.length;
                }
            }
        }
        const totalChanges = requestChanges + sampleChanges;
        const totalChangesHeader = handlePlural(
            totalChanges,
            '0 Edits',
            '1 Edit',
            `${totalChanges} Edits`
        );
        const requestChangesHeader = handlePlural(
            requestChanges,
            '',
            'Request 1',
            `Request ${requestChanges}`
        );
        const sampleChangesHeader = handlePlural(
            sampleChanges,
            '',
            'Sample 1',
            `Sample ${sampleChanges}`
        );
        updateEditHeaderLabel(totalChangesHeader);
        updateEditHeaderRequestLabel(requestChangesHeader);
        updateEditHeaderSampleLabel(sampleChangesHeader);
        updateMetadataTables(metadataTables);
        if (metadataTables.length !== 0) {
            updatePatchReady(true);
        } else {
            updatePatchReady(false);
        }
    };

    const compareSamples = (firstSample, secondSample) => {
        for (const singleIdKey of sampleVerificationKeys) {
            if (!(singleIdKey in firstSample) && !(singleIdKey in secondSample)) {
                continue;
            }
            if (!(singleIdKey in firstSample) || !(singleIdKey in secondSample)) {
                return false;
            }
            if (firstSample[singleIdKey] !== secondSample[singleIdKey]) {
                return false;
            }
        }
        return true;
    };

    const findUnlabeledSample = (metadataRow, currentSamples) => {
        for (const [, singleUnlabeledSampleValue] of Object.entries(currentSamples)) {
            if (compareSamples(singleUnlabeledSampleValue['metadata'], metadataRow)) {
                return singleUnlabeledSampleValue['label'];
            }
        }
        return null;
    };

    const setUpSampleList = (currentFileId, currentMetadataChanges, currentSampleIdMetadataKey) => {
        let labeledSampleDict = {};
        let newSampleFiles = {};
        let unlabeledSampleCounter = 1;
        if (!metadata) {
            return;
        }
        for (const singleFile of metadata) {
            let sampleObj = {};
            sampleObj['metadata'] = singleFile['metadata'];
            const { id: fileId } = singleFile;
            let sampleId = fileId;
            sampleObj['id'] = fileId;
            sampleObj['page'] = renderTab;
            if (fileId in sampleFiles) {
                sampleId = sampleFiles[fileId];
            }
            let {
                sample: {
                    [sampleId]: {
                        [currentSampleIdMetadataKey]: { current: currentLabel = null } = {},
                    } = {},
                } = {},
            } = currentMetadataChanges;
            let {
                metadata: { [currentSampleIdMetadataKey]: sampleLabel },
            } = singleFile;

            if (currentLabel) {
                sampleLabel = currentLabel;
            } else if (sampleLabel) {
                sampleObj['label'] = sampleLabel;
            } else {
                const unlabeledSampleName = findUnlabeledSample(
                    singleFile['metadata'],
                    labeledSampleDict
                );
                if (!unlabeledSampleName) {
                    sampleLabel = `Unlabeled ${unlabeledSampleCounter}`;
                    unlabeledSampleCounter += 1;
                } else {
                    newSampleFiles[fileId] = labeledSampleDict[unlabeledSampleName]['id'];
                    continue;
                }
            }
            if (!(sampleLabel in labeledSampleDict)) {
                sampleObj['label'] = sampleLabel;
                sampleObj['id'] = fileId;
                labeledSampleDict[sampleLabel] = sampleObj;
                newSampleFiles[fileId] = fileId;
            } else {
                newSampleFiles[fileId] = labeledSampleDict[sampleLabel]['id'];
            }
        }

        let newSampleList = Object.values(labeledSampleDict);

        newSampleList.sort(function (firstSample, secondSample) {
            return firstSample['label'].localeCompare(secondSample['label']);
        });
        const newSampleHeaderLabel = handlePlural(
            newSampleList.length,
            '0 Samples',
            `${newSampleList.length} Sample`,
            `${newSampleList.length} Samples`
        );
        updateSampleHeaderLabel(newSampleHeaderLabel);

        let newSampleIndex = sampleIndex;
        if (currentFileId) {
            let currentSampleId = currentFileId;
            if (currentFileId in newSampleFiles) {
                currentSampleId = newSampleFiles[currentFileId];
            }
            newSampleIndex = newSampleList.findIndex((singleSample) => {
                return singleSample['id'] === currentSampleId;
            });
        }
        updateSampleIndex(newSampleIndex);
        updateSampleList(newSampleList);
        updateSampleFiles(newSampleFiles);
        updateSampleHeader(newSampleList[newSampleIndex]['label']);
        return { newSampleList, newSampleFiles };
    };

    const setUpSampleTable = (
        metadataParam,
        sampleListParam,
        sampleFilesParam,
        sampleIndexParam
    ) => {
        if (metadataParam && sampleListParam.length != 0) {
            const { id: sampleId } = sampleListParam[sampleIndexParam];
            let sampleKeyValue = {};
            let fileKeyList = [];
            let fileObjList = [];
            let qcObjectList = [];
            let qcStrObjList = [];

            const metadataSampleFiles = metadataParam.filter(
                (singleFile) => sampleFilesParam[singleFile['id']] === sampleId
            );

            for (const singleFile of metadataSampleFiles) {
                for (const [key, value] of Object.entries(singleFile['metadata'])) {
                    if (!requestKeyList.includes(key)) {
                        if (key == qcReportField) {
                            const {
                                metadata: { [qcReportField]: qcValueList = {} },
                            } = singleFile;
                            if (qcValueList && qcValueList.length > 0) {
                                for (const singleQcValue of qcValueList) {
                                    if (singleQcValue && Object.keys(singleQcValue).length > 0) {
                                        const singleQcValueStr = JSON.stringify(singleQcValue);
                                        if (!qcStrObjList.includes(singleQcValueStr)) {
                                            qcObjectList.push(singleQcValue);
                                            qcStrObjList.push(singleQcValueStr);
                                        }
                                    }
                                }
                            }
                        } else if (key in sampleKeyValue) {
                            const { [key]: otherFileValue } = sampleKeyValue;
                            if (JSON.stringify(value) !== JSON.stringify(otherFileValue)) {
                                fileKeyList.push(key);
                            }
                        } else {
                            sampleKeyValue[key] = value;
                        }
                    }
                }
            }

            const singleSample = metadataSampleFiles[0];
            let allKeys = Object.keys(singleSample['metadata']);
            let { metadata: currentSampleMetadata } = singleSample;
            for (const singleFile of metadataSampleFiles) {
                let singleFileObj = {};
                for (const singleKey of fileKeyList) {
                    singleFileObj[singleKey] = singleFile['metadata'][singleKey];
                }
                singleFileObj['fileName'] = singleFile['file_name'];

                fileObjList.push(singleFileObj);
            }

            let notSampleKeysList = requestKeyList.concat(fileKeyList, qcReportField);
            let sampleKeyList = allKeys.filter(
                (singleKey) => !notSampleKeysList.includes(singleKey)
            );

            const { data, column, titleToField } = setupDictTable(
                currentSampleMetadata,
                sampleKeyList,
                1,
                FIELED_BACKGROUND_COLOR,
                FIELD_COLOR,
                true
            );

            const fileColumnWidth = { R: 10 };
            const qcColumnSort = { IGORecommendation: 1, qcReportType: 2 };

            const fileTableDataObj = setupTable(fileObjList, fileColumnWidth, 'R');

            const qcTableDataObj = setupTable(
                qcObjectList,
                {},
                'IGORecommendation',
                [],
                qcColumnSort
            );

            return {
                sampleMetaData: data,
                sampleMetaColumn: column,
                sampleTitleToField: titleToField,
                fileData: JSON.parse(JSON.stringify(fileTableDataObj['tableData'])),
                fileColumn: fileTableDataObj['tableColumn'],
                fileTitleToField: fileTableDataObj['tableTitleToField'],
                qcData: JSON.parse(JSON.stringify(qcTableDataObj['tableData'])),
                qcColumn: qcTableDataObj['tableColumn'],
                qcTitleToField: qcTableDataObj['tableTitleToField'],
            };
        }
    };

    const deserializeSample = (sampleChanges) => {
        for (const [singleKey, singleValidationType] of Object.entries(metadataValidation)) {
            let { [singleKey]: { current } = {}, [singleKey]: { initial } = {} } = sampleChanges;
            if (current) {
                sampleChanges[singleKey]['current'] = deserialize(current, singleValidationType);
            }
            if (initial) {
                sampleChanges[singleKey]['initial'] = deserialize(initial, singleValidationType);
            }
            if (String(initial) === String(current)) {
                delete sampleChanges[singleKey];
            }
        }

        return sampleChanges;
    };

    const renderTab = (stateInfo) => {
        const {
            stateMetadata,
            stateMetadataChanges,
            stateSampleList,
            stateSampleFiles,
            stateSampleIndex,
            stateSampleInfoType,
            stateSampleIdMetadataKey,
        } = stateInfo;
        const {
            sampleMetaData,
            sampleMetaColumn,
            sampleTitleToField,
            fileData,
            fileColumn,
            qcData,
            qcColumn,
        } = setUpSampleTable(stateMetadata, stateSampleList, stateSampleFiles, stateSampleIndex);
        return (
            <span>
                <Tabs
                    value={stateSampleInfoType}
                    onChange={handleInfoTypeChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="Metadata" />
                    <Tab label="Files" />
                    <Tab label="QC Report" />
                </Tabs>

                {stateSampleInfoType === 0 && (
                    <MaterialTable
                        data={[...sampleMetaData]}
                        columns={sampleMetaColumn}
                        title=""
                        onSearchChange={(change) => handleSampleSearchChange(change)}
                        components={{
                            EditField: getFormikEditInput(),
                            EditRow: getFormikEditRow(createYupValidation(metadataValidation)),
                            Container: function createSampleContainer(props) {
                                return <Paper {...props} elevation={0} />;
                            },
                        }}
                        options={{
                            headerStyle: {
                                backgroundColor: HEADER_BACKGROUND_COLOR,
                                color: HEADER_COLOR,
                            },
                            pageSize: 10,
                            searchText: sessionStorage.getItem('sampleSearch'),
                        }}
                        editable={{
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve) => {
                                    const { id: sampleId } = stateSampleList[stateSampleIndex];
                                    let {
                                        sample: { [sampleId]: currentSampleChanges = {} } = {},
                                    } = stateMetadataChanges;
                                    currentSampleChanges = recordChanges(
                                        oldData,
                                        newData,
                                        currentSampleChanges,
                                        sampleTitleToField
                                    );
                                    const deserializedSampleChanges = deserializeSample(
                                        currentSampleChanges
                                    );
                                    stateMetadataChanges['sample'][
                                        sampleId
                                    ] = deserializedSampleChanges;
                                    let newMetadata = [];
                                    for (const singleFile of stateMetadata) {
                                        let fileObj = { ...singleFile };
                                        const { id: fileId } = fileObj;
                                        const fileChangeId = stateSampleFiles[fileId];
                                        if (fileChangeId === sampleId) {
                                            fileObj['metadata'] = editObj(
                                                newData,
                                                singleFile['metadata'],
                                                sampleTitleToField
                                            );
                                        }
                                        newMetadata.push(fileObj);
                                    }
                                    updateMetadata(newMetadata);
                                    updateMetadataChanges(stateMetadataChanges);
                                    if (stateSampleIdMetadataKey in deserializedSampleChanges) {
                                        const { newSampleList, newSampleFiles } = setUpSampleList(
                                            sampleId,
                                            stateMetadataChanges,
                                            stateSampleIdMetadataKey
                                        );
                                        renderMetaDataChanges(
                                            stateMetadataChanges,
                                            newSampleList,
                                            newSampleFiles
                                        );
                                    } else {
                                        renderMetaDataChanges(
                                            stateMetadataChanges,
                                            stateSampleList,
                                            stateSampleFiles
                                        );
                                    }

                                    resolve();
                                }).catch(function (error) {
                                    console.log(error);
                                }),
                        }}
                    />
                )}

                {stateSampleInfoType === 1 && (
                    <MaterialTable
                        data={fileData}
                        columns={fileColumn}
                        title=""
                        components={{
                            Container: function createFileContainer(props) {
                                return <Paper {...props} elevation={0} />;
                            },
                        }}
                        options={{
                            headerStyle: {
                                backgroundColor: HEADER_BACKGROUND_COLOR,
                                color: HEADER_COLOR,
                            },
                        }}
                    />
                )}
                {stateSampleInfoType === 2 && qcData.length === 0 && (
                    <Typography component="div">
                        <Box textAlign="center" padding="100px">
                            {noQcReportDataMessage}
                        </Box>
                    </Typography>
                )}

                {stateSampleInfoType === 2 && qcData.length !== 0 && (
                    <MaterialTable
                        data={qcData}
                        columns={qcColumn}
                        title=""
                        components={{
                            Container: function createFileContainer(props) {
                                return <Paper {...props} elevation={0} />;
                            },
                        }}
                        options={{
                            headerStyle: {
                                backgroundColor: HEADER_BACKGROUND_COLOR,
                                color: HEADER_COLOR,
                            },
                        }}
                    />
                )}
            </span>
        );
    };

    const checkRequestHeader = (requestId) => {
        if (!requestId || !requestId.trim()) {
            updateRequestHeader('Unlabeled');
        } else {
            updateRequestHeader(requestId.trim());
        }
    };

    const setUpRequestTable = () => {
        if (metadata) {
            const { data, column, titleToField } = setupDictTable(
                metadata[0]['metadata'],
                requestKeyList,
                2,
                FIELED_BACKGROUND_COLOR,
                FIELD_COLOR,
                true
            );
            checkRequestHeader(metadata[0]['metadata'][requestField]);
            updateRequestData(data);
            updateRequestColumn(column);
            updateRequestTitleToField(titleToField);
        }
    };

    const getFormikEditRow = (validationObj) => {
        const FormikEditRow = ({ onEditingApproved, columns, ...props }) => {
            let newColumns = JSON.parse(JSON.stringify(columns));
            for (let singleColumn of newColumns) {
                const { field } = singleColumn;
                let disableEdit = false;
                if (field.includes('field') && !(field in props.data)) {
                    disableEdit = true;
                } else {
                    const dataFieldKey = field.replace('value', 'field');
                    if (!(dataFieldKey in props.data)) {
                        disableEdit = true;
                    }
                }
                if (disableEdit) {
                    singleColumn['editable'] = 'never';
                    let { cellStyle } = singleColumn;
                    if (!cellStyle) {
                        cellStyle = {};
                    }
                    cellStyle['transition'] = 'all 300ms ease 0s';
                    cellStyle['opacity'] = '0.2';
                    singleColumn['cellStyle'] = cellStyle;
                }
            }
            const formValidationObj = addTableValidation(props.data, validationObj);
            const yupFormValidation = Yup.object().shape(formValidationObj);
            return (
                <Formik
                    initialValues={props.data}
                    validationSchema={yupFormValidation}
                    onSubmit={(newData) => {
                        onEditingApproved(props.mode, newData, props.data);
                    }}
                >
                    {({ submitForm }) => (
                        <MTableEditRow
                            {...props}
                            columns={newColumns}
                            onEditingApproved={submitForm}
                        />
                    )}
                </Formik>
            );
        };

        return FormikEditRow;
    };

    const getFormikEditInput = () => {
        const FormikMTInput = (props) => (
            <Field name={props.columnDef.field}>
                {({ field, form }) => {
                    const { name } = field;
                    const { errors, setFieldValue } = form;

                    const showError = !!getIn(errors, name);

                    return (
                        <div>
                            <MTableEditField
                                {...props}
                                {...field}
                                error={showError}
                                onChange={(newValue) => setFieldValue(name, newValue)}
                            />
                            {errors[field.name] && (
                                <div style={{ color: red[500] }}>{errors[field.name]}</div>
                            )}
                        </div>
                    );
                }}
            </Field>
        );

        return FormikMTInput;
    };

    const patchMetadata = () => {
        let updatePayload = { patch_files: [] };
        for (const singleFile of metadata) {
            let metadataPatch = {};
            const fileId = singleFile['id'];
            const sampleId = sampleFiles[fileId];

            if (Object.keys(metadataChanges['request']).length !== 0) {
                for (const singleRequestMetadataKey of Object.keys(metadataChanges['request'])) {
                    metadataPatch[singleRequestMetadataKey] =
                        metadataChanges['request'][singleRequestMetadataKey]['current'];
                }
            }
            if (sampleId in metadataChanges['sample']) {
                let sampleChanges = metadataChanges['sample'][sampleId];
                for (const singleSampleMetadataKey of Object.keys(sampleChanges)) {
                    metadataPatch[singleSampleMetadataKey] =
                        sampleChanges[singleSampleMetadataKey]['current'];
                }
            }
            if (Object.keys(metadataPatch).length !== 0) {
                updatePayload['patch_files'].push({
                    patch: { metadata: metadataPatch },
                    id: fileId,
                });
            }
        }

        pushEvent('patch', updatePayload);
    };

    const resetMetadata = () => {
        updateMetadataChanges({ request: {}, sample: {} });
        updateMetadata([]);
        updateRequestData([]);
        updateSampleList([]);
        updateResetProcessing(false);
    };

    useEffect(() => {
        if (handleEvent && pushEvent) {
            if (metadata && metadata.length !== 0) {
                setUp();
            } else if (metadata.length == 0 && metadataList.length != 0) {
                updateMetadata(metadataList);
            } else {
                pushEvent('fetch', params);
            }
        } else {
            sessionStorage.removeItem('sampleSearch');
        }
    }, [metadata]);

    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.root}>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Breadcrumbs className={classes.heading}>
                            <Typography> Request </Typography>
                            <Breadcrumbs separator=" " className={classes.heading}>
                                <Typography color="textPrimary"> {requestHeader} </Typography>
                                <Button
                                    className={classes.changeRequestButton}
                                    variant="outlined"
                                    size="small"
                                    onClick={(event) => {
                                        window.open(
                                            new URL(metadataInputRoute, document.location),
                                            '_blank'
                                        );
                                        event.stopPropagation();
                                    }}
                                >
                                    Change Request
                                </Button>
                            </Breadcrumbs>
                        </Breadcrumbs>
                    </AccordionSummary>
                    <AccordionDetails className={classes.accordianDetailRoot}>
                        {!requestData ||
                            (requestData.length == 0 && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Skeleton
                                            animation="wave"
                                            variant="rect"
                                            className={classes.loadingTableHeader}
                                        ></Skeleton>
                                    </Grid>
                                    {loadingRequestWidth.map(function (value, index) {
                                        return (
                                            <Grid item xs={value} key={index}>
                                                <Skeleton
                                                    animation="wave"
                                                    variant="rect"
                                                    className={classes.loadingTableRow}
                                                ></Skeleton>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            ))}
                        {requestData && requestData.length != 0 && (
                            <MaterialTable
                                data={[...requestData]}
                                columns={requestColumn}
                                title=""
                                components={{
                                    Container: function createRequestContainer(props) {
                                        return (
                                            <Paper
                                                {...props}
                                                elevation={0}
                                                className={classes.requestTable}
                                            />
                                        );
                                    },
                                    EditField: getFormikEditInput(),
                                    EditRow: getFormikEditRow(
                                        createYupValidation(metadataValidation)
                                    ),
                                }}
                                options={{
                                    headerStyle: {
                                        backgroundColor: HEADER_BACKGROUND_COLOR,
                                        color: HEADER_COLOR,
                                    },
                                    pageSize: 8,
                                    pageSizeOptions: [8, 16, 24],
                                }}
                                editable={{
                                    onRowUpdate: (newData, oldData) =>
                                        new Promise((resolve) => {
                                            const index = oldData.tableData.id;
                                            let newRequestData = requestData;
                                            newRequestData[index] = newData;
                                            let newMetadataChanges = metadataChanges;
                                            newMetadataChanges['request'] = recordChanges(
                                                oldData,
                                                newData,
                                                metadataChanges['request'],
                                                requestTitleToField
                                            );
                                            updateRequestData(newRequestData);
                                            updateMetadataChanges(newMetadataChanges);
                                            renderMetaDataChanges(
                                                metadataChanges,
                                                sampleList,
                                                sampleFiles
                                            );
                                            resolve();
                                        }).catch(function (error) {
                                            console.log(error);
                                        }),
                                }}
                            />
                        )}
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                    >
                        <Breadcrumbs className={classes.heading}>
                            <Typography> {sampleHeaderLabel} </Typography>
                            <Breadcrumbs separator=" " className={classes.heading}>
                                <Typography color="textPrimary"> {sampleHeader} </Typography>
                                <ButtonGroup>
                                    {sampleLabelKeys.map((sampleKey, index) => (
                                        <Button
                                            key={index}
                                            variant="outlined"
                                            size="small"
                                            className={
                                                sampleKey[0] === sampleIdMetadataKey
                                                    ? classes.sampleIdSelected
                                                    : classes.sampleIdNotSelected
                                            }
                                            onClick={(event) => {
                                                updateSampleIdMetadataKey(sampleKey[0]);
                                                const {
                                                    newSampleList,
                                                    newSampleFiles,
                                                } = setUpSampleList(
                                                    sampleList[sampleIndex]['id'],
                                                    metadataChanges,
                                                    sampleKey[0]
                                                );
                                                renderMetaDataChanges(
                                                    metadataChanges,
                                                    newSampleList,
                                                    newSampleFiles
                                                );
                                                event.stopPropagation();
                                            }}
                                        >
                                            {sampleKey[1]}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </Breadcrumbs>
                        </Breadcrumbs>
                    </AccordionSummary>
                    <AccordionDetails className={classes.accordianDetailRoot}>
                        {!sampleList ||
                            (sampleList.length == 0 && (
                                <Grid container spacing={1}>
                                    <Grid item xs={2}>
                                        <Grid container spacing={2} justify="center">
                                            {loadingSampleListWidth.map(function (value, index) {
                                                return (
                                                    <Grid item xs={value} key={index}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="text"
                                                        ></Skeleton>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={10}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <div className={classes.loadingTableHeader}></div>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Skeleton
                                                    animation="wave"
                                                    variant="rect"
                                                    className={classes.loadingTableHeader}
                                                ></Skeleton>
                                            </Grid>
                                            {loadingSampleTableWidth.map(function (value, index) {
                                                return (
                                                    <Grid item xs={value} key={index}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rect"
                                                            className={classes.loadingTableRow}
                                                        ></Skeleton>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))}
                        {sampleList && sampleList.length != 0 && (
                            <VerticalTabs
                                stateInfo={stateInfo}
                                handleChange={handleSampleChange}
                                tabs={sampleList}
                                currentTab={stateInfo['stateSampleIndex']}
                            />
                        )}
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3a-content"
                        id="panel3a-header"
                    >
                        <Breadcrumbs className={classes.heading}>
                            <Typography> {editHeaderLabel} </Typography>
                            {editHeaderRequestLabel && (
                                <Typography> {editHeaderRequestLabel} </Typography>
                            )}
                            {editHeaderSampleLabel && (
                                <Typography> {editHeaderSampleLabel} </Typography>
                            )}
                        </Breadcrumbs>
                    </AccordionSummary>
                    <AccordionDetails className={classes.accordianDetailRoot}>
                        {metadataTables.map((table) => (
                            <MaterialTable
                                data={[...table.data]}
                                key={table.title}
                                columns={table.column}
                                title={table.title}
                                components={{
                                    Container: function createTableContainer(props) {
                                        return (
                                            <Paper
                                                {...props}
                                                elevation={0}
                                                className={classes.changeTable}
                                            />
                                        );
                                    },
                                }}
                                options={{
                                    headerStyle: {
                                        backgroundColor: HEADER_BACKGROUND_COLOR,
                                        color: HEADER_COLOR,
                                    },
                                    paging: false,
                                }}
                            />
                        ))}
                        {!patchReady && (
                            <Typography component="div">
                                <Box textAlign="center">{noMetadataChangesMessage}</Box>
                            </Typography>
                        )}

                        <div className={classes.buttonRow}>
                            <Button
                                size="large"
                                variant="contained"
                                color="primary"
                                className={classes.submitButton}
                                disabled={!patchReady || patchProcessing}
                                startIcon={<i className="material-icons">publish</i>}
                                endIcon={
                                    patchProcessing ? (
                                        <CircularProgress className={classes.progressSpinner} />
                                    ) : null
                                }
                                onClick={() => {
                                    updatePatchProcessing(true);
                                    patchMetadata();
                                }}
                            >
                                Submit
                            </Button>
                            <Button
                                size="large"
                                variant="contained"
                                color="secondary"
                                className={classes.submitButton}
                                disabled={resetProcessing}
                                startIcon={
                                    <i className="material-icons">settings_backup_restore</i>
                                }
                                endIcon={
                                    resetProcessing ? (
                                        <CircularProgress className={classes.progressSpinner} />
                                    ) : null
                                }
                                onClick={() => {
                                    updateResetProcessing(true);
                                    resetMetadata();
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </AccordionDetails>
                </Accordion>
            </div>
        </Container>
    );
}
