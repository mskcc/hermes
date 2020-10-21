import React from 'react';
import { Formik } from 'formik';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import './Login.css';
import { bindActionCreators } from 'redux';
import * as loginActions from '@/LoginPage/LoginActions';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
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

const mapStateToProps = function (state) {
    return {
        current_user: state.loginReducer.current_user,
        current_user_error: state.loginReducer.current_user_error,
    };
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators(loginActions, dispatch);
};

const useStyles = (theme) => ({
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
});

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        // redirect to summary if already logged in
        if (localStorage.getItem('currentUser')) {
            this.props.history.push('/metadata');
        }

        this.login = this.login.bind(this);
    }

    login(username, password) {
        const login = this.props.login(username, password);
        return login;
    }

    render() {
        const { classes, history } = this.props;
        if (this.props.current_user) {
            // return <Redirect to="/Summary" />;
        }
        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <i className="material-icons">lock_outline</i>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Formik
                        initialValues={{
                            username: '',
                            password: '',
                        }}
                        enableReinitialize={false}
                        validationSchema={Yup.object().shape({
                            username: Yup.string().required('Username is required'),
                            password: Yup.string().required('Password is required'),
                        })}
                        onSubmit={(
                            { username, password },
                            { setStatus, setErrors, setSubmitting }
                        ) => {
                            this.login(username, password).then(() => {
                                setSubmitting(false);
                                if (this.props.current_user_error) {
                                    setErrors({ password: this.props.current_user_error.detail });
                                } else {
                                    history.push('/metadata');
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
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="password"
                                    onChange={handleChange}
                                    values={values.password}
                                    error={errors.password && touched.password}
                                    helperText={
                                        errors.password && touched.password ? errors.password : null
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
                                    Sign In
                                </Button>
                            </form>
                        )}
                    </Formik>
                </div>
            </Container>
        );
    }
}

const ConnectedLoginPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(useStyles)(LoginPage));
export default ConnectedLoginPage;
