import React from 'react';
import { Formik, Field, getIn } from 'formik';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import { bindActionCreators } from 'redux';
import * as loginActions from '@/LoginPage/LoginActions';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { summaryService, authenticationService } from '@/_services';
import red from '@material-ui/core/colors/red';
import {
    setupDictTable,
    setupTable,
    addTableValidation,
    recordChanges,
    editObj,
    setupChangesTable,
} from '@/_helpers';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Alert, AlertTitle } from '@material-ui/lab';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import * as filePageActions from '@/Files/FilesPageActions';
import * as metadataActions from '@/Metadata/MetadataActions';
import { resourceNotFound } from '../UserMessages';
import { REQUEST_METADATA_LIST } from '../constants';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MaterialTable, { FormField, MTableEditField, MTableEditRow } from 'material-table';
import VerticalTabs from '@/_components/VerticalTabs';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { REQUEST_VALIDATION } from '@/Metadata/MetadataValidation';
import { NO_CHANGES } from '../UserMessages';

const mapStateToProps = function (state) {
    return {
        file_metadata: state.filesPageReducer.file_metadata,
        update: state.metadataReducer.update,
        updateProcessing: state.metadataReducer.updateProcessing,
        updateError: state.metadataReducer.updateError,
    };
};

const mapDispatchToProps = function (dispatch) {
    return {
        actions: {
            filePageActions: bindActionCreators(filePageActions, dispatch),
            metadataActions: bindActionCreators(metadataActions, dispatch),
        },
    };
};

const paperHeight = '5vh';

const useStyles = (theme) => ({
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
});

class MetadataPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: authenticationService.currentUserValue,
            errorOpen: true,
            updateErrorOpen: true,
            updateStatusOpen: true,
            updateReady: false,
            resetProcessing: false,
            reloadProcessing: false,
            metadata: null,
            metadataQuery: null,
            metadataChanges: { request: {}, sample: {} },
            metadataTables: [],
            requestData: [],
            requestColumn: [],
            requestTitleToField: {},
            sampleTitleToFied: {},
            sampleColumn: [],
            sampleList: [],
            sampleIndex: 0,
            sampleInfoType: 0,
            sampleMetaData: [],
            sampleMetaColumn: [],
            sampleTitleToField: {},
            fileData: [],
            fileColumn: [],
            fileTitleToField: {},
        };

        this.setUp = this.setUp.bind(this);
        this.renderTab = this.renderTab.bind(this);
        this.handleSampleChange = this.handleSampleChange.bind(this);
        this.handleInfoTypeChange = this.handleInfoTypeChange.bind(this);
        this.setUpRequestTable = this.setUpRequestTable.bind(this);
        this.setUpSampleTable = this.setUpSampleTable.bind(this);
        this.setUpSampleList = this.setUpSampleList.bind(this);
        this.renderMetaDataChanges = this.renderMetaDataChanges.bind(this);
        this.resetMetadata = this.resetMetadata.bind(this);
        this.reloadMetada = this.reloadMetada.bind(this);
    }

    setUp() {
        this.setUpSampleList();
        this.setUpRequestTable();
    }

    setUpRequestTable() {
        const { metadata } = this.state;

        if (metadata) {
            const { data, keys, column, titleToField } = setupDictTable(
                metadata[0]['metadata'],
                REQUEST_METADATA_LIST,
                2,
                'darkslateblue',
                '#FFF',
                true
            );

            this.setState({
                requestData: data,
                requestColumn: column,
                requestTitleToField: titleToField,
            });
        }
    }

    setUpSampleList() {
        const { metadata } = this.state;

        if (metadata) {
            let sampleObjs = {};
            let sampleTabObjList = [];
            for (const singleFile of metadata) {
                let sampleName = singleFile['metadata']['sampleName'];
                if (!(sampleName in sampleObjs)) {
                    sampleObjs[sampleName] = {
                        label: sampleName,
                        page: this.renderTab,
                    };
                }
            }

            sampleTabObjList = Object.values(sampleObjs);
            this.setState({ sampleList: sampleTabObjList }, this.setUpSampleTable);
        }
    }

    setUpSampleTable() {
        const { metadata, sampleIndex, sampleList } = this.state;

        if (metadata) {
            let sampleName = sampleList[sampleIndex]['label']; // metadata[sampleIndex]['metadata']['sampleName'];
            let sampleKeyValue = {};
            let fileKeyList = [];
            let fileObjList = [];
            for (const singleFile of metadata) {
                if (singleFile['metadata']['sampleName'] === sampleName) {
                    for (const [key, value] of Object.entries(singleFile['metadata'])) {
                        if (REQUEST_METADATA_LIST.includes(key)) {
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

            for (const singleFile of metadata) {
                if (singleFile['metadata']['sampleName'] == sampleName) {
                    let singleFileObj = {};
                    for (const singleKey of fileKeyList) {
                        singleFileObj[singleKey] = singleFile['metadata'][singleKey];
                    }
                    singleFileObj['fileName'] = singleFile['file_name'];
                    fileObjList.push(singleFileObj);
                    allKeys = Object.keys(singleFile['metadata']);
                }
            }

            let notSampleKeysList = REQUEST_METADATA_LIST.concat(fileKeyList);
            let sampleKeyList = allKeys.filter(
                (singleKey) => !notSampleKeysList.includes(singleKey)
            );

            const { data, keys, column, titleToField } = setupDictTable(
                metadata[sampleIndex]['metadata'],
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
    }

    componentDidMount() {}

    handleSampleChange(event, newValue) {
        this.setState({ sampleIndex: newValue });
    }

    handleInfoTypeChange(event, newValue) {
        this.setState({ sampleInfoType: newValue });
    }

    getFormikEditRow(validationObj) {
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
    }

    getFormikEditInput() {
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
    }

    resetMetadata() {
        this.setState(
            {
                metadataChanges: { request: {}, sample: {} },
                metadata: this.props.file_metadata.results,
                resetProcessing: false,
            },
            () => {
                this.setUp();
                this.renderMetaDataChanges();
            }
        );
    }

    updateMetadata() {
        const { metadataChanges, metadata } = this.state;
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

        console.log(updatePayload);

        this.props.actions.metadataActions.updateMetadata(updatePayload).then(() => {
            this.setState(
                {
                    reloadProcessing: true,
                },
                this.reloadMetada
            );
        });
    }

    reloadMetada() {
        const { metadataQuery } = this.state;
        this.props.actions.filePageActions
            .loadFilesList({
                metadata: [metadataQuery],
                count: false,
                state_key: 'file_metadata',
            })
            .then(() => {
                this.setState(
                    {
                        metadata: this.props.file_metadata.results,
                        metadataChanges: { request: {}, sample: {} },
                        reloadProcessing: false,
                    },
                    () => {
                        this.setUp();
                        this.renderMetaDataChanges();
                    }
                );
            });
    }

    renderMetaDataChanges() {
        const { metadataChanges } = this.state;
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

        if (metadataTables.length !== 0) {
            this.setState({ metadataTables: metadataTables, updateReady: true });
        } else {
            this.setState({ metadataTables: metadataTables, updateReady: false });
        }
    }

    renderTab() {
        const {
            sampleMetaData,
            sampleMetaColumn,
            sampleTitleToField,
            fileData,
            fileColumn,
            fileTitleToField,
        } = this.setUpSampleTable();
        const { sampleInfoType } = this.state;
        return (
            <span>
                <Tabs
                    value={sampleInfoType}
                    onChange={this.handleInfoTypeChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="Metadata" />
                    <Tab label="Files" />
                </Tabs>

                {sampleInfoType === 0 && (
                    <MaterialTable
                        data={[...sampleMetaData]}
                        columns={sampleMetaColumn}
                        title=""
                        components={{
                            EditField: this.getFormikEditInput(),
                            EditRow: this.getFormikEditRow({}),
                            Container: (props) => <Paper {...props} elevation={0} />,
                        }}
                        options={{
                            headerStyle: {
                                backgroundColor: 'slategrey',
                                color: '#FFF',
                            },
                            pageSize: 10,
                        }}
                        editable={{
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve, reject) => {
                                    const {
                                        metadata,
                                        metadataChanges,
                                        sampleIndex,
                                        sampleList,
                                    } = this.state;
                                    let sampleName = sampleList[sampleIndex]['label'];
                                    if (!(sampleName in metadataChanges['sample'])) {
                                        metadataChanges['sample'][sampleName] = {};
                                    }
                                    metadataChanges['sample'][sampleName] = recordChanges(
                                        oldData,
                                        newData,
                                        metadataChanges['sample'][sampleName],
                                        sampleTitleToField
                                    );
                                    let newMetadata = [];
                                    for (const singleFile of metadata) {
                                        let fileObj = { ...singleFile };
                                        if (singleFile['metadata']['sampleName'] === sampleName) {
                                            fileObj['metadata'] = editObj(
                                                newData,
                                                singleFile['metadata'],
                                                sampleTitleToField
                                            );
                                        }
                                        console.log(fileObj);
                                        newMetadata.push(fileObj);
                                    }
                                    this.setState(
                                        {
                                            metadata: newMetadata,
                                            metadataChanges: metadataChanges,
                                        },
                                        () => {
                                            this.renderMetaDataChanges();
                                            resolve();
                                        }
                                    );
                                }).catch(function (error) {
                                    console.log(error);
                                }),
                        }}
                    />
                )}

                {sampleInfoType === 1 && (
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
    }

    render() {
        const { classes, history } = this.props;
        const {
            errorOpen,
            metadata,
            requestData,
            requestColumn,
            sampleList,
            metadataChanges,
            metadataTables,
            updateReady,
            resetProcessing,
            reloadProcessing,
            updateErrorOpen,
            updateStatusOpen,
            requestTitleToField,
        } = this.state;
        if (metadata) {
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
                                        EditField: this.getFormikEditInput(),
                                        EditRow: this.getFormikEditRow(REQUEST_VALIDATION),
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
                                                this.setState(
                                                    {
                                                        requestData: newRequestData,
                                                        metadataChanges: newMetadataChanges,
                                                    },
                                                    () => {
                                                        this.renderMetaDataChanges();
                                                        resolve();
                                                    }
                                                );
                                            }).catch(function (error) {
                                                console.log(error);
                                            }),
                                    }}
                                />
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
                                <VerticalTabs
                                    handleChange={this.handleSampleChange}
                                    tabs={sampleList}
                                />
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
                                {!updateReady &&
                                    (!updateErrorOpen || !this.props.updateError) &&
                                    (!updateStatusOpen || !this.props.update) && (
                                        <Typography component="div">
                                            <Box textAlign="center">{NO_CHANGES}</Box>
                                        </Typography>
                                    )}
                                <Collapse in={updateErrorOpen}>
                                    {this.props.updateError && (
                                        <Alert
                                            severity="error"
                                            action={
                                                <IconButton
                                                    aria-label="close"
                                                    color="inherit"
                                                    size="small"
                                                    onClick={() => {
                                                        this.setState({ updateErrorOpen: false });
                                                    }}
                                                >
                                                    <i className="material-icons">close</i>
                                                </IconButton>
                                            }
                                        >
                                            <AlertTitle>Error</AlertTitle>
                                            {this.props.updateError}
                                        </Alert>
                                    )}
                                </Collapse>
                                <Collapse in={updateStatusOpen}>
                                    {this.props.update && (
                                        <Alert
                                            severity="success"
                                            action={
                                                <IconButton
                                                    aria-label="close"
                                                    color="inherit"
                                                    size="small"
                                                    onClick={() => {
                                                        this.setState({ updateStatusOpen: false });
                                                    }}
                                                >
                                                    <i className="material-icons">close</i>
                                                </IconButton>
                                            }
                                        >
                                            <AlertTitle>Success!</AlertTitle>
                                            {this.props.update}
                                        </Alert>
                                    )}
                                </Collapse>
                                <div className={classes.buttonRow}>
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="primary"
                                        className={classes.submitButton}
                                        disabled={!updateReady || this.props.updateProcessing}
                                        startIcon={<i className="material-icons">publish</i>}
                                        endIcon={
                                            this.props.updateProcessing || this.reloadProcessing ? (
                                                <CircularProgress
                                                    className={classes.progressSpinner}
                                                />
                                            ) : null
                                        }
                                        onClick={() => {
                                            this.setState(
                                                {
                                                    updateStatusOpen: true,
                                                    updateErrorOpen: true,
                                                },
                                                this.updateMetadata()
                                            );
                                        }}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="secondary"
                                        className={classes.submitButton}
                                        disabled={!updateReady || resetProcessing}
                                        startIcon={
                                            <i className="material-icons">
                                                settings_backup_restore
                                            </i>
                                        }
                                        endIcon={
                                            resetProcessing ? (
                                                <CircularProgress
                                                    className={classes.progressSpinner}
                                                />
                                            ) : null
                                        }
                                        onClick={() => {
                                            this.setState(
                                                {
                                                    resetProcessing: true,
                                                },
                                                this.resetMetadata
                                            );
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
        } else {
            return (
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <i className="material-icons">search</i>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Enter a request or sample Id
                        </Typography>
                        <Formik
                            initialValues={{
                                id: '',
                                type: '',
                            }}
                            enableReinitialize={false}
                            validationSchema={Yup.object().shape({
                                id: Yup.string().required('Id is required'),
                                type: Yup.string().required('Type is required'),
                            })}
                            onSubmit={({ id, type }, { setStatus, setErrors, setSubmitting }) => {
                                const metadataQuery = type + ':' + id;
                                this.props.actions.filePageActions
                                    .loadFilesList({
                                        metadata: [metadataQuery],
                                        count: false,
                                        state_key: 'file_metadata',
                                    })
                                    .then(() => {
                                        setSubmitting(false);
                                        //handle server not found/bad request errors
                                        if (this.props.file_metadata.count == 0) {
                                            let userFriendlyType = '';
                                            if (type.includes('request')) {
                                                userFriendlyType = 'request';
                                            } else {
                                                userFriendlyType = 'sample';
                                            }
                                            const errorMessage = resourceNotFound(
                                                'metadata',
                                                userFriendlyType,
                                                id
                                            );
                                            this.setState({ errorOpen: true });
                                            setErrors({ general: errorMessage });
                                        } else {
                                            this.setState(
                                                {
                                                    metadataQuery: metadataQuery,
                                                    metadata: this.props.file_metadata.results,
                                                },
                                                this.setUp
                                            );
                                        }
                                    });
                            }}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                isSubmitting,
                            }) => (
                                <form className={classes.form} onSubmit={handleSubmit}>
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        label="Id"
                                        name="id"
                                        id="id"
                                        onChange={handleChange}
                                        values={values.id}
                                        error={errors.id && touched.id}
                                        helperText={errors.id && touched.id ? errors.id : null}
                                        autoFocus
                                    />
                                    <FormControl variant="outlined" className={classes.form}>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={values.type}
                                            id="type"
                                            name="type"
                                            onChange={handleChange}
                                            error={errors.type && touched.type}
                                            label="Type"
                                        >
                                            <MenuItem value={'sampleId'}>Sample</MenuItem>
                                            <MenuItem value={'requestId'}>Request</MenuItem>
                                        </Select>
                                        <FormHelperText error={errors.type && touched.type}>
                                            {errors.type && touched.type ? errors.type : null}
                                        </FormHelperText>
                                    </FormControl>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                        disabled={isSubmitting}
                                        endIcon={
                                            isSubmitting ? (
                                                <CircularProgress
                                                    className={classes.progressSpinner}
                                                />
                                            ) : null
                                        }
                                    >
                                        Submit
                                    </Button>
                                    <Collapse in={errorOpen}>
                                        {errors.general && (
                                            <Alert
                                                severity="error"
                                                action={
                                                    <IconButton
                                                        aria-label="close"
                                                        color="inherit"
                                                        size="small"
                                                        onClick={() => {
                                                            this.setState({ errorOpen: false });
                                                        }}
                                                    >
                                                        <i className="material-icons">close</i>
                                                    </IconButton>
                                                }
                                            >
                                                <AlertTitle>Error</AlertTitle>
                                                {errors.general}
                                            </Alert>
                                        )}
                                    </Collapse>
                                </form>
                            )}
                        </Formik>
                    </div>
                </Container>
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(MetadataPage));
