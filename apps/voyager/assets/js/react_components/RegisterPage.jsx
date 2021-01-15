import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
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
    loginText: {
        textAlign: 'center',
    },
}));

export default function RegisterPage(props) {
    const classes = useStyles();
    const { registerRoute, registerSuccessRoute, loginRoute, formKey } = props;
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    const redirectToLogin = () => {
        window.location.replace(loginRoute);
    };
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <i className="material-icons">person_add</i>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <Formik
                    initialValues={{
                        username: '',
                        first_name: '',
                        last_name: '',
                    }}
                    enableReinitialize={false}
                    validationSchema={Yup.object().shape({
                        username: Yup.string().required('MKSCC username is required'),
                        first_name: Yup.string().required('First name is required'),
                        last_name: Yup.string().required('Last name is required'),
                    })}
                    onSubmit={(
                        { username, first_name, last_name },
                        { setErrors, setSubmitting }
                    ) => {
                        axios
                            .post(registerRoute, {
                                [formKey]: {
                                    username: username,
                                    first_name: first_name,
                                    last_name: last_name,
                                },
                            })
                            .then(() => {
                                window.location.replace(registerSuccessRoute);
                            })
                            .catch((err) => {
                                if (err.response) {
                                    let data = err.response.data;
                                    let status = err.response.status;
                                    if (status == 400) {
                                        setErrors({
                                            username: data.username,
                                            first_name: data.first_name,
                                            last_name: data.last_name,
                                        });
                                    } else if (status == 500) {
                                        setErrors({
                                            last_name: data,
                                        });
                                    } else {
                                        console.log('Unexpected error in register: ');
                                        console.log('status: ' + status);
                                        console.log('data: ' + data);
                                    }
                                } else {
                                    setErrors({
                                        last_name:
                                            'Unfortunately, it looks like our webserver is down. We should have it back up shortly.',
                                    });
                                    console.log('Unexpected error in register: ');
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
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                onChange={handleChange}
                                values={values.username}
                                error={errors.username && touched.username}
                                helperText={
                                    errors.username && touched.username ? errors.username : null
                                }
                                autoFocus
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                id="first_name"
                                label="First Name"
                                name="first_name"
                                autoComplete="given-name"
                                onChange={handleChange}
                                values={values.first_name}
                                error={errors.first_name && touched.first_name}
                                helperText={
                                    errors.first_name && touched.first_name
                                        ? errors.first_name
                                        : null
                                }
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                id="last_name"
                                label="Last Name"
                                name="last_name"
                                autoComplete="family-name"
                                onChange={handleChange}
                                values={values.last_name}
                                error={errors.last_name && touched.last_name}
                                helperText={
                                    errors.last_name && touched.last_name ? errors.last_name : null
                                }
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
                                Register
                            </Button>
                            <Typography className={classes.loginText}>
                                Already have an account?&nbsp;
                                <Link href="#" onClick={redirectToLogin}>
                                    Login here!
                                </Link>
                            </Typography>
                        </form>
                    )}
                </Formik>
            </div>
        </Container>
    );
}
