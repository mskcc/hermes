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
import Autocomplete from '@material-ui/lab/Autocomplete';
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
    loadingSpinner: {
        position: 'absolute',
        right: '40px',
    },
}));

const FILTER_GROUP_LIMIT = 3;

export default function MetadataFormPage(props) {
    const classes = useStyles();
    const { metadataFormRoute, formKey, metadataQueryRoute, search_key } = props;
    const [recommendation, updateRecommendation] = useState([]);
    const [idType, updateIdType] = useState('');
    const [loading, updateLoading] = useState(false);
    const [errorMessage, updateErrorMessage] = useState('');
    const [searchQuery, updateSearchQuery] = useState('');
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');

    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;

    const addRecommendations = (metadataQueryRoute, search_key, search_key_value) => {
        axios
            .get(metadataQueryRoute, {
                params: {
                    [search_key]: search_key_value,
                },
            })
            .then((response) => {
                const message = response.data.message;
                if (message) {
                    updateErrorMessage(message);
                }
                updateRecommendation(response.data.search);
            })
            .finally(() => {
                updateLoading(false);
            });
    };

    useEffect(() => {
        updateRecommendation([]);
        const debouncedSearchHandler = setTimeout(() => {
            updateLoading(true);
            addRecommendations(metadataQueryRoute, search_key, searchQuery);
        }, 500);

        return () => {
            updateLoading(false);
            clearTimeout(debouncedSearchHandler);
        };
    }, [searchQuery]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <i className="material-icons">search</i>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Enter the metadata ID
                </Typography>
                <Formik
                    initialValues={{
                        id: '',
                    }}
                    enableReinitialize={false}
                    validationSchema={Yup.object().shape({
                        id: Yup.string().required('ID is required'),
                    })}
                    onSubmit={({ id }, { setErrors, setSubmitting }) => {
                        axios
                            .post(metadataFormRoute, {
                                [formKey]: {
                                    id: id,
                                    type: idType,
                                },
                            })
                            .then((response) => {
                                window.location.replace(response.request.responseURL);
                            })
                            .catch((err) => {
                                if (err.response) {
                                    let data = err.response.data;
                                    let status = err.response.status;
                                    if (status == 400 || status == 500) {
                                        setErrors({ id: data });
                                    } else {
                                        console.log('Unexpected error in metadata selection: ');
                                        console.log('status: ' + status);
                                        console.log('data: ' + data);
                                    }
                                } else {
                                    setErrors({
                                        id: 'Unfortunately, it looks like our webserver is down. We should have it back up shortly.',
                                    });
                                    console.log('Unexpected error in metadata selection: ');
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
                                freeSolo={true}
                                options={recommendation}
                                filterOptions={(options, { inputValue }) => {
                                    let foundOptions = {};
                                    let optionList = [];
                                    for (const singleOption of options) {
                                        const { field, title } = singleOption;
                                        if (
                                            title
                                                .toLowerCase()
                                                .includes(inputValue.toLowerCase()) ||
                                            inputValue === ''
                                        ) {
                                            if (!(field in foundOptions)) {
                                                foundOptions[field] = 0;
                                            }
                                            if (foundOptions[field] < FILTER_GROUP_LIMIT) {
                                                optionList.push(singleOption);
                                                foundOptions[field] += 1;
                                            }
                                        }
                                    }
                                    return optionList;
                                }}
                                groupBy={(option) => option['type']}
                                getOptionLabel={(option) => option['title']}
                                loading={loading}
                                onInputChange={(event, newValue) => {
                                    updateSearchQuery(newValue);
                                }}
                                onChange={(event, newValue) => {
                                    values.id = newValue['title'];
                                    handleChange(newValue['title']);
                                    updateIdType(newValue['field']);
                                }}
                                renderOption={(option, { inputValue }) => {
                                    return findMatchParts(option['title'], inputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        label="Id"
                                        name="id"
                                        id="id"
                                        error={(errors.id && touched.id) || errorMessage}
                                        helperText={
                                            errors.id && touched.id ? errors.id : errorMessage
                                        }
                                        autoFocus
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loading ? (
                                                        <CircularProgress
                                                            color="inherit"
                                                            size={20}
                                                            className={classes.loadingSpinner}
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
