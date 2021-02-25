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
import { Skeleton } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

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
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
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
    const [sampleIndex, updateSampleIndex] = useState(0);
    const [sampleInfoType, updateSampleInfoType] = useState(0);
    const [unlabeledSampleDict, updateUnlabeledSampleDict] = useState({});
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    const stateInfo = {
        stateMetadata: metadata,
        stateMetadataChanges: metadataChanges,
        stateSampleList: sampleList,
        stateUnlabeledSampleDict: unlabeledSampleDict,
        stateSampleIndex: sampleIndex,
        stateSampleInfoType: sampleInfoType,
    };

    const loadingRequestWidth = [1, 2, 4, 2, 3, 1, 2, 4, 2, 3, 1, 2, 4, 2, 3];
    const loadingSampleTableWidth = [1, 5, 6, 1, 5, 6, 1, 5, 6];
    const loadingSampleListWidth = [11, 11, 11, 11, 11, 11];

    const setUp = () => {
        setUpSampleList();
        setUpRequestTable();
    };

    const handleSampleChange = (event, newValue) => {
        updateSampleIndex(newValue);
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

    const isUnlabeledSample = (metadataRow, sampleName, unlabeledSamples) => {
        if (sampleName in unlabeledSamples) {
            return compareSamples(metadataRow, unlabeledSamples[sampleName]);
        }
        return false;
    };

    const findUnlabeledSample = (metadataRow, unlabeledSamples) => {
        for (const [singleUnlabeledSampleKey, singleUnlabeledSampleValue] of Object.entries(
            unlabeledSamples
        )) {
            if (compareSamples(singleUnlabeledSampleValue, metadataRow)) {
                return singleUnlabeledSampleKey;
            }
        }
        return null;
    };

    const setUpSampleList = () => {
        let sampleObjs = {};
        let sampleTabObjList = [];
        let unlabeledSampleCounter = 1;
        let unlabeledSamples = {};
        if (metadata) {
            for (const singleFile of metadata) {
                let sampleName = singleFile['metadata']['sampleName'];
                if (!sampleName) {
                    sampleName = findUnlabeledSample(singleFile['metadata'], unlabeledSamples);
                    if (!sampleName) {
                        let singleUnlabledFile = {};
                        for (const singleIdKey of sampleVerificationKeys) {
                            singleUnlabledFile[singleIdKey] = singleFile['metadata'][singleIdKey];
                        }
                        sampleName = `Unlabeled ${unlabeledSampleCounter}`;
                        unlabeledSamples[sampleName] = singleUnlabledFile;
                        unlabeledSampleCounter += 1;
                    }
                }
                if (!(sampleName in sampleObjs)) {
                    sampleObjs[sampleName] = {
                        label: sampleName,
                        page: renderTab,
                    };
                }
            }

            sampleTabObjList = Object.values(sampleObjs);
            sampleTabObjList.sort(function (firstSample, secondSample) {
                return firstSample['label'].localeCompare(secondSample['label']);
            });
            updateSampleList(sampleTabObjList);
            updateUnlabeledSampleDict(unlabeledSamples);
        }
    };

    const setUpSampleTable = (
        metadataParam,
        sampleListParam,
        sampleIndexParam,
        unlabeledSamplesParam
    ) => {
        if (metadataParam && sampleListParam.length != 0) {
            let sampleName = sampleListParam[sampleIndexParam]['label'];
            let sampleKeyValue = {};
            let fileKeyList = [];
            let fileObjList = [];
            let qcObjectList = [];
            for (const singleFile of metadataParam) {
                if (
                    singleFile['metadata']['sampleName'] === sampleName ||
                    isUnlabeledSample(singleFile['metadata'], sampleName, unlabeledSamplesParam)
                ) {
                    for (const [key, value] of Object.entries(singleFile['metadata'])) {
                        if (!requestKeyList.includes(key)) {
                            if (key == qcReportField) {
                                const qcValueList = singleFile['metadata'][qcReportField];
                                if (qcValueList && qcValueList.length > 0) {
                                    for (const singleQcValue of qcValueList) {
                                        if (
                                            singleQcValue &&
                                            Object.keys(singleQcValue).length > 0
                                        ) {
                                            let unique = true;
                                            for (const singleQcObject of qcObjectList) {
                                                if (
                                                    JSON.stringify(singleQcObject) ===
                                                    JSON.stringify(singleQcValue)
                                                ) {
                                                    unique = false;
                                                }
                                            }
                                            if (unique) {
                                                qcObjectList.push(singleQcValue);
                                            }
                                        }
                                    }
                                }
                            } else if (key in sampleKeyValue) {
                                const otherFileValue = sampleKeyValue[key];
                                if (Array.isArray(otherFileValue) && Array.isArray(value)) {
                                    if (otherFileValue.toString() !== value.toString()) {
                                        fileKeyList.push(otherFileValue);
                                    }
                                } else if (value !== sampleKeyValue[key]) {
                                    fileKeyList.push(key);
                                }
                            } else {
                                sampleKeyValue[key] = value;
                            }
                        }
                    }
                }
            }

            let allKeys = [];
            let currentSampleMetadata = {};

            for (const singleFile of metadataParam) {
                if (
                    singleFile['metadata']['sampleName'] == sampleName ||
                    isUnlabeledSample(singleFile['metadata'], sampleName, unlabeledSamplesParam)
                ) {
                    let singleFileObj = {};
                    for (const singleKey of fileKeyList) {
                        singleFileObj[singleKey] = singleFile['metadata'][singleKey];
                    }
                    singleFileObj['fileName'] = singleFile['file_name'];
                    currentSampleMetadata = singleFile['metadata'];
                    fileObjList.push(singleFileObj);
                    allKeys = Object.keys(singleFile['metadata']);
                }
            }

            let notSampleKeysList = requestKeyList.concat(fileKeyList, qcReportField);
            let sampleKeyList = allKeys.filter(
                (singleKey) => !notSampleKeysList.includes(singleKey)
            );

            const { data, column, titleToField } = setupDictTable(
                currentSampleMetadata,
                sampleKeyList,
                1,
                'darkslateblue',
                '#FFF',
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

    const renderTab = (stateInfo) => {
        const {
            stateMetadata,
            stateMetadataChanges,
            stateSampleList,
            stateUnlabeledSampleDict,
            stateSampleIndex,
            stateSampleInfoType,
        } = stateInfo;
        const {
            sampleMetaData,
            sampleMetaColumn,
            sampleTitleToField,
            fileData,
            fileColumn,
            qcData,
            qcColumn,
        } = setUpSampleTable(
            stateMetadata,
            stateSampleList,
            stateSampleIndex,
            stateUnlabeledSampleDict
        );
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
                            EditRow: getFormikEditRow(createYupValidation(metadata_validation)),
                            Container: function createSampleContainer(props) {
                                return <Paper {...props} elevation={0} />;
                            },
                        }}
                        options={{
                            headerStyle: {
                                backgroundColor: 'slategrey',
                                color: '#FFF',
                            },
                            pageSize: 10,
                            searchText: sessionStorage.getItem('sampleSearch'),
                        }}
                        editable={{
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve) => {
                                    let sampleName = stateSampleList[stateSampleIndex]['label'];
                                    let newSampleList = stateSampleList;
                                    if (!(sampleName in stateMetadataChanges['sample'])) {
                                        stateMetadataChanges['sample'][sampleName] = {};
                                    }
                                    stateMetadataChanges['sample'][sampleName] = recordChanges(
                                        oldData,
                                        newData,
                                        stateMetadataChanges['sample'][sampleName],
                                        sampleTitleToField
                                    );
                                    for (const [singleKey, singleValidationType] of Object.entries(
                                        metadata_validation
                                    )) {
                                        const titleCaseKey = convertToTitleCase(singleKey);
                                        if (
                                            titleCaseKey in
                                            stateMetadataChanges['sample'][sampleName]
                                        ) {
                                            let singleMetadataObj =
                                                stateMetadataChanges['sample'][sampleName][
                                                    titleCaseKey
                                                ];
                                            if (singleMetadataObj['current']) {
                                                singleMetadataObj['current'] = deserialize(
                                                    singleMetadataObj['current'],
                                                    singleValidationType
                                                );
                                            }
                                            if (singleMetadataObj['initial']) {
                                                singleMetadataObj['initial'] = deserialize(
                                                    singleMetadataObj['initial'],
                                                    singleValidationType
                                                );
                                            }
                                            if (
                                                String(singleMetadataObj['initial']) ==
                                                String(singleMetadataObj['current'])
                                            ) {
                                                delete stateMetadataChanges['sample'][sampleName][
                                                    titleCaseKey
                                                ];
                                            }
                                        }
                                    }
                                    if (
                                        'Sample Name' in stateMetadataChanges['sample'][sampleName]
                                    ) {
                                        let newSampleName =
                                            stateMetadataChanges['sample'][sampleName][
                                                'Sample Name'
                                            ]['current'];
                                        if (newSampleName !== sampleName) {
                                            stateMetadataChanges['sample'][newSampleName] =
                                                stateMetadataChanges['sample'][sampleName];
                                            delete stateMetadataChanges['sample'][sampleName];

                                            newSampleList[stateSampleIndex][
                                                'label'
                                            ] = newSampleName;
                                            const currentSelectedSample =
                                                newSampleList[stateSampleIndex];
                                            newSampleList.sort(function (
                                                firstSample,
                                                secondSample
                                            ) {
                                                return firstSample['label'].localeCompare(
                                                    secondSample['label']
                                                );
                                            });
                                            const newSampleIndex = newSampleList.findIndex(
                                                (singleSample) => {
                                                    return singleSample === currentSelectedSample;
                                                }
                                            );
                                            updateSampleIndex(newSampleIndex);
                                        }
                                    }
                                    let newMetadata = [];
                                    for (const singleFile of stateMetadata) {
                                        let fileObj = { ...singleFile };
                                        if (
                                            singleFile['metadata']['sampleName'] === sampleName ||
                                            isUnlabeledSample(
                                                singleFile['metadata'],
                                                sampleName,
                                                stateUnlabeledSampleDict
                                            )
                                        ) {
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
                                    updateSampleList(newSampleList);
                                    renderMetaDataChanges();
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
                                backgroundColor: 'slategrey',
                                color: '#FFF',
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
                                backgroundColor: 'slategrey',
                                color: '#FFF',
                            },
                        }}
                    />
                )}
            </span>
        );
    };

    const setUpRequestTable = () => {
        if (metadata) {
            const { data, column, titleToField } = setupDictTable(
                metadata[0]['metadata'],
                requestKeyList,
                2,
                'darkslateblue',
                '#FFF',
                true
            );

            updateRequestData(data);
            updateRequestColumn(column);
            updateRequestTitleToField(titleToField);
        }
    };

    const getFormikEditRow = (validationObj) => {
        const FormikEditRow = ({ onEditingApproved, ...props }) => {
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
                        <MTableEditRow {...props} onEditingApproved={submitForm} />
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
            const file_id = singleFile['id'];
            let sampleName = singleFile['metadata']['sampleName'];
            if (!sampleName) {
                sampleName = findUnlabeledSample(singleFile['metadata'], unlabeledSampleDict);
            }
            if (Object.keys(metadataChanges['request']).length !== 0) {
                for (const singleRequestMetadataKey of Object.keys(metadataChanges['request'])) {
                    const requestField =
                        metadataChanges['request'][singleRequestMetadataKey]['field'];
                    metadataPatch[requestField] =
                        metadataChanges['request'][singleRequestMetadataKey]['current'];
                }
            }
            if (sampleName in metadataChanges['sample']) {
                for (const singleSampleMetadataKey of Object.keys(
                    metadataChanges['sample'][sampleName]
                )) {
                    const sampleField =
                        metadataChanges['sample'][sampleName][singleSampleMetadataKey]['field'];
                    metadataPatch[sampleField] =
                        metadataChanges['sample'][sampleName][singleSampleMetadataKey]['current'];
                }
            }
            if (Object.keys(metadataPatch).length !== 0) {
                updatePayload['patch_files'].push({
                    patch: { metadata: metadataPatch },
                    id: file_id,
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

    useEffect(() => {
        renderMetaDataChanges();
    }, [metadataChanges]);

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
                        <Typography className={classes.heading}>Request</Typography>
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
                                        createYupValidation(metadata_validation)
                                    ),
                                }}
                                options={{
                                    headerStyle: {
                                        backgroundColor: 'slategrey',
                                        color: '#FFF',
                                    },
                                    pageSize: 6,
                                    pageSizeOptions: [6, 12, 20],
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
                                            renderMetaDataChanges();
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
                        <Typography className={classes.heading}>Sample</Typography>
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
                        <Typography className={classes.heading}>Submit</Typography>
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
                                        backgroundColor: 'slategrey',
                                        color: '#FFF',
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
