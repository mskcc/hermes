import React, { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import { findMatchParts } from '@/_helpers';
const useStyles = makeStyles((theme) => ({
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
    progressSpinner: {
        width: '1.5rem !important',
        height: '1.5rem !important',
    },
}));

const filterOptions = createFilterOptions({
    limit: 10,
});

function addRecommendations(
    id_type,
    runQueryRoute,
    type_key,
    updateTypeFunction,
    updateLoadingFunction
) {
    updateLoadingFunction(true);
    axios
        .get(runQueryRoute, {
            params: {
                [type_key]: id_type,
            },
        })
        .then((response) => {
            updateTypeFunction(response.data);
        })
        .finally(() => {
            updateLoadingFunction(false);
        });
}

export default function MetadataFormPage(props) {
    const classes = useStyles();
    const { runSubmitRoute, runSuccessRoute, formKey, runQueryRoute, type_key } = props;
    const [requestRecommendation, updateRequestRecommendation] = useState([]);
    const [requestLoading, updateRequestLoading] = useState(false);
    const [pipelineRecommendation, updatePipelineRecommendation] = useState([]);
    const [formatedPipelineRecommendation, updateFormatedPipelineRecommendation] = useState([]);
    const [pipelineLoading, updatePipelineLoading] = useState(false);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;

    const setup = () => {
        addRecommendations(
            'requestId',
            runQueryRoute,
            type_key,
            updateRequestRecommendation,
            updateRequestLoading
        );
        addRecommendations(
            'pipeline',
            runQueryRoute,
            type_key,
            updatePipelineRecommendation,
            updatePipelineLoading
        );
    };

    const formatPipelineList = () => {
        const formatedList = pipelineRecommendation.map((pipeline) => pipeline.name);
        updateFormatedPipelineRecommendation(formatedList);
    };

    useEffect(() => {
        setup();
    }, []);

    useEffect(() => {
        formatPipelineList();
    }, [pipelineRecommendation]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <i className="material-icons">work_outline</i>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Submit a run
                </Typography>
                <Formik
                    initialValues={{
                        request: '',
                        pipeline: '',
                    }}
                    enableReinitialize={false}
                    validationSchema={Yup.object().shape({
                        request: Yup.string().required('Request is required'),
                        pipeline: Yup.string().required('Pipeline is required'),
                    })}
                    onSubmit={({ request, pipeline }, { setErrors, setSubmitting }) => {
                        axios
                            .post(runSubmitRoute, {
                                [formKey]: {
                                    request: request,
                                    pipeline: pipeline,
                                },
                            })
                            .then((response) => {
                                window.location.replace(runSuccessRoute);
                            })
                            .catch((err) => {
                                if (err.response) {
                                    let data = err.response.data;
                                    let status = err.response.status;
                                    if (status == 400 || status == 500) {
                                        setErrors({ request: data });
                                    } else {
                                        console.log('Unexpected error in run submit: ');
                                        console.log('status: ' + status);
                                        console.log('data: ' + data);
                                    }
                                } else {
                                    setErrors({
                                        request:
                                            'Unfortunately, it looks like our webserver is down. We should have it back up shortly.',
                                    });
                                    console.log('Unexpected error in run submit: ');
                                    console.error(err);
                                }
                            })
                            .finally(() => {
                                setSubmitting(false);
                            });
                    }}
                >
                    {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                        <form className={classes.form} onSubmit={handleSubmit}>
                            <Autocomplete
                                disableListWrap
                                options={requestRecommendation}
                                filterOptions={filterOptions}
                                loading={requestLoading}
                                onInputChange={(event, newValue) => {
                                    values.request = newValue;
                                    handleChange(newValue);
                                }}
                                renderOption={(option, { inputValue }) => {
                                    return findMatchParts(option, inputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        label="Request"
                                        name="request"
                                        id="request"
                                        error={errors.request && touched.request}
                                        helperText={
                                            errors.request && touched.request
                                                ? errors.request
                                                : null
                                        }
                                        autoFocus
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {requestLoading ? (
                                                        <CircularProgress
                                                            color="inherit"
                                                            size={20}
                                                        />
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                            />

                            <Autocomplete
                                disableListWrap
                                options={formatedPipelineRecommendation}
                                filterOptions={filterOptions}
                                loading={pipelineLoading}
                                onInputChange={(event, newValue) => {
                                    values.pipeline = newValue;
                                    handleChange(newValue);
                                }}
                                renderOption={(option, { inputValue }) => {
                                    return findMatchParts(option, inputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        label="Pipeline"
                                        name="pipeline"
                                        id="pipeline"
                                        error={errors.pipeline && touched.pipeline}
                                        helperText={
                                            errors.pipeline && touched.pipeline
                                                ? errors.pipeline
                                                : null
                                        }
                                        autoFocus
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {pipelineLoading ? (
                                                        <CircularProgress
                                                            color="inherit"
                                                            size={20}
                                                        />
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                disabled={isSubmitting}
                                endIcon={
                                    isSubmitting ? (
                                        <CircularProgress className={classes.progressSpinner} />
                                    ) : null
                                }
                            >
                                Submit
                            </Button>
                        </form>
                    )}
                </Formik>
            </div>
        </Container>
    );
}
