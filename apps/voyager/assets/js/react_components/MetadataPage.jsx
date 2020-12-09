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
    createEmailYupValidation,
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
    const { metadataList, requestKeyList, emailKeyList, params, handleEvent, pushEvent } = props;
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
    const NO_CHANGES_MESSAGE = 'Hmmm, it looks like there are no changes ready to publish';
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    const stateInfo = {
        stateMetadata: metadata,
        stateMetadataChanges: metadataChanges,
        stateSampleList: sampleList,
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

    const renderMetaDataChanges = () => {
        let metadataTables = [];
        if (Object.keys(metadataChanges['request']).length !== 0) {
            const { data, column } = setupChangesTable(metadataChanges['request']);
            const title = 'Request';
            metadataTables.push({ data: data, column: column, title: title });
        }

        if (Object.keys(metadataChanges['sample']).length !== 0) {
            for (const singleSample of Object.keys(metadataChanges['sample'])) {
                const { data, column } = setupChangesTable(metadataChanges['sample'][singleSample]);
                const title = 'Sample: ' + singleSample;
                metadataTables.push({ data: data, column: column, title: title });
            }
        }
        updateMetadataTables(metadataTables);
        if (metadataTables.length !== 0) {
            updatePatchReady(true);
        } else {
            updatePatchReady(false);
        }
    };

    const setUpSampleList = () => {
        let sampleObjs = {};
        let sampleTabObjList = [];
        if (metadata) {
            for (const singleFile of metadata) {
                let sampleName = singleFile['metadata']['sampleName'];
                if (!(sampleName in sampleObjs)) {
                    sampleObjs[sampleName] = {
                        label: sampleName,
                        page: renderTab,
                    };
                }
            }

            sampleTabObjList = Object.values(sampleObjs);
            updateSampleList(sampleTabObjList);
        }
        return sampleTabObjList;
    };

    const setUpSampleTable = (metadataParam, sampleListParam, sampleIndexParam) => {
        if (metadataParam && sampleListParam.length != 0) {
            let sampleName = sampleListParam[sampleIndexParam]['label'];
            let sampleKeyValue = {};
            let fileKeyList = [];
            let fileObjList = [];
            for (const singleFile of metadataParam) {
                if (singleFile['metadata']['sampleName'] === sampleName) {
                    for (const [key, value] of Object.entries(singleFile['metadata'])) {
                        if (requestKeyList.includes(key)) {
                            continue;
                        }
                        if (key in sampleKeyValue) {
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

            let allKeys = [];
            let currentSampleMetadata = {};

            for (const singleFile of metadataParam) {
                if (singleFile['metadata']['sampleName'] == sampleName) {
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

            let notSampleKeysList = requestKeyList.concat(fileKeyList);
            let sampleKeyList = allKeys.filter(
                (singleKey) => !notSampleKeysList.includes(singleKey)
            );

            const { data, keys, column, titleToField } = setupDictTable(
                currentSampleMetadata,
                sampleKeyList,
                1,
                'darkslateblue',
                '#FFF',
                true
            );

            const fieldColumnWidth = { R: 10 };

            const { tableData, tableColumn, tableTitleToField } = setupTable(
                fileObjList,
                fieldColumnWidth,
                'R'
            );

            return {
                sampleMetaData: data,
                sampleMetaColumn: column,
                sampleTitleToField: titleToField,
                fileData: tableData,
                fileColumn: tableColumn,
                fileTitleToField: tableTitleToField,
            };
        }
    };

    const renderTab = (stateInfo) => {
        const {
            stateMetadata,
            stateMetadataChanges,
            stateSampleList,
            stateSampleIndex,
            stateSampleInfoType,
        } = stateInfo;
        const {
            sampleMetaData,
            sampleMetaColumn,
            sampleTitleToField,
            fileData,
            fileColumn,
        } = setUpSampleTable(stateMetadata, stateSampleList, stateSampleIndex);
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
                </Tabs>

                {stateSampleInfoType === 0 && (
                    <MaterialTable
                        data={[...sampleMetaData]}
                        columns={sampleMetaColumn}
                        title=""
                        onSearchChange={(change) => handleSampleSearchChange(change)}
                        components={{
                            EditField: getFormikEditInput(),
                            EditRow: getFormikEditRow({}),
                            Container: (props) => <Paper {...props} elevation={0} />,
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
                                new Promise((resolve, reject) => {
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
                                    if (
                                        'Sample Name' in stateMetadataChanges['sample'][sampleName]
                                    ) {
                                        let newSampleName =
                                            stateMetadataChanges['sample'][sampleName][
                                                'Sample Name'
                                            ]['current'];
                                        stateMetadataChanges['sample'][newSampleName] =
                                            stateMetadataChanges['sample'][sampleName];
                                        delete stateMetadataChanges['sample'][sampleName];

                                        newSampleList[stateSampleIndex]['label'] = newSampleName;
                                    }
                                    let newMetadata = [];
                                    for (const singleFile of stateMetadata) {
                                        let fileObj = { ...singleFile };
                                        if (singleFile['metadata']['sampleName'] === sampleName) {
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
                            Container: (props) => <Paper {...props} elevation={0} />,
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
            const sampleName = singleFile['metadata']['sampleName'];
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
                sessionStorage.removeItem('sampleSearch');
                setUp();
            } else if (metadata.length == 0 && metadataList.length != 0) {
                updateMetadata(metadataList);
            } else {
                pushEvent('fetch', params);
            }
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
                                    Container: (props) => (
                                        <Paper
                                            {...props}
                                            elevation={0}
                                            className={classes.requestTable}
                                        />
                                    ),
                                    EditField: getFormikEditInput(),
                                    EditRow: getFormikEditRow(
                                        createEmailYupValidation(emailKeyList)
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
                                        new Promise((resolve, reject) => {
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
                                    Container: (props) => (
                                        <Paper
                                            {...props}
                                            elevation={0}
                                            className={classes.changeTable}
                                        />
                                    ),
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
                                <Box textAlign="center">{NO_CHANGES_MESSAGE}</Box>
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
