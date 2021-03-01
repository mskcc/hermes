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
import Autocomplete from "@material-ui/core/Autocomplete";
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
    const {
        metadataFormRoute,
        formKey,
        id_keys,
        initial_id_type,
        metadataQueryRoute,
        type_key,
    } = props;
    const [recommendation, updateRecommendation] = useState([]);
    const [idType, updateIdType] = useState(initial_id_type);
    const [loading, updateLoading] = useState(false);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');

    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;

    const addRecommendations = (id_types, metadataQueryRoute, type_key) => {
        let id_field_params = [];
        let id_title_params = [];
        id_keys.sort((a, b) => a[0].localeCompare(b[0]));
        for (const singleType of id_keys) {
            id_field_params.push(singleType[0]);
            id_title_params.push(singleType[1]);
        }

        axios
            .get(metadataQueryRoute, {
                params: {
                    [type_key]: id_field_params,
                },
            })
            .then((response) => {
                let ids_added_dict = {};
                let recommendationList = [];
                for (const singleResponseObj of response.data) {
                    for (const [index, singleRecommendation] of singleResponseObj.entries()) {
                        if (singleRecommendation) {
                            const recommendationName = id_field_params[index];
                            if (!(recommendationName in ids_added_dict)) {
                                ids_added_dict[recommendationName] = {};
                            }
                            if (!(singleRecommendation in ids_added_dict[recommendationName])) {
                                let recommendationObj = {
                                    title: singleRecommendation,
                                    type: id_title_params[index],
                                    field: id_field_params[index],
                                };
                                ids_added_dict[recommendationName][singleRecommendation] = null;
                                recommendationList.push(recommendationObj);
                            }
                        }
                    }
                }
                recommendationList.sort((a, b) => a['type'].localeCompare(b['type']));
                updateRecommendation(recommendationList);
            })
            .finally(() => {
                updateLoading(false);
            });
    };

    useEffect(() => {
        updateLoading(true);
        addRecommendations(id_keys, metadataQueryRoute, type_key);
    }, []);

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
                                    //console.log(options);
                                    //return options;
                                }}
                                groupBy={(option) => option['type']}
                                getOptionLabel={(option) => option['title']}
                                loading={loading}
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
