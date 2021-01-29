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
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import axios from 'axios';

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

function changeRecommendations(
    id_type,
    metadataQueryRoute,
    type_key,
    updateRecommendation,
    updateLoading
) {
    updateLoading(true);
    axios
        .get(metadataQueryRoute, {
            params: {
                [type_key]: id_type,
            },
        })
        .then((response) => {
            updateRecommendation(response.data);
        })
        .finally(() => {
            updateLoading(false);
        });
}

export default function MetadataFormPage(props) {
    const classes = useStyles();
    const {
        metadataFormRoute,
        formKey,
        id_keys,
        initial_id_type,
        metadataQueryRoute,
        type_key,
    } = props;
    const [recommendation, updateRecommendation] = useState([]);
    const [current_id_type, updateIdType] = useState(initial_id_type);
    const [loading, updateLoading] = useState(false);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');

    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;

    useEffect(() => {
        changeRecommendations(
            current_id_type,
            metadataQueryRoute,
            type_key,
            updateRecommendation,
            updateLoading
        );
    }, [current_id_type]);
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
                        type: initial_id_type,
                    }}
                    enableReinitialize={false}
                    validationSchema={Yup.object().shape({
                        id: Yup.string().required('ID is required'),
                        type: Yup.string().required('ID type is required'),
                    })}
                    onSubmit={({ id, type }, { setErrors, setSubmitting }) => {
                        axios
                            .post(metadataFormRoute, {
                                [formKey]: {
                                    id: id,
                                    type: type,
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
                                        id:
                                            'Unfortunately, it looks like our webserver is down. We should have it back up shortly.',
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
                                options={recommendation}
                                filterOptions={filterOptions}
                                loading={loading}
                                onInputChange={(event, newValue) => {
                                    values.id = newValue;
                                    handleChange(newValue);
                                }}
                                renderOption={(option, { inputValue }) => {
                                    let parts = [];
                                    if (
                                        inputValue &&
                                        inputValue.length !== 0 &&
                                        inputValue.trim().length !== 0
                                    ) {
                                        const match = option.search(inputValue);
                                        if (match !== -1) {
                                            const start = 0;
                                            const end = option.length;
                                            const match_start = match;
                                            const match_end = match + inputValue.length;
                                            if (match_start !== start) {
                                                const part = {
                                                    text: option.substring(start, match_start),
                                                    highlight: false,
                                                };
                                                parts.push(part);
                                            }
                                            const matched_part = {
                                                text: option.substring(match_start, match_end),
                                                highlight: true,
                                            };
                                            parts.push(matched_part);
                                            if (match_end !== end) {
                                                const part = {
                                                    text: option.substring(match_end, end),
                                                    highlight: false,
                                                };
                                                parts.push(part);
                                            }
                                        } else {
                                            parts = [{ text: option, highlight: false }];
                                        }
                                    } else {
                                        parts = [{ text: option, highlight: false }];
                                    }
                                    return (
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    );
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
                                        error={errors.id && touched.id}
                                        helperText={errors.id && touched.id ? errors.id : null}
                                        autoFocus
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loading ? (
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

                            <FormControl variant="outlined" className={classes.form}>
                                <InputLabel>ID Type</InputLabel>
                                <Select
                                    value={values.type}
                                    id="type"
                                    name="type"
                                    onChange={function updateRecommendation(event) {
                                        const new_id_type = event.target.value;
                                        updateIdType(new_id_type);
                                        handleChange(event);
                                    }}
                                    error={errors.type && touched.type}
                                    label="ID Type"
                                >
                                    {id_keys.map((value, index) => {
                                        const [item_value, item_label] = value;
                                        return (
                                            <MenuItem key={index} value={item_value}>
                                                {item_label}
                                            </MenuItem>
                                        );
                                    })}
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
