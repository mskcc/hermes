import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from "@material-ui/core/Alert";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    error: {
        background: '#f44336',
    },
    warning: {
        background: '#ff9800',
    },
    info: {
        background: '#2196f3',
    },
    success: {
        background: '#4caf50',
    },
}));

export default function CustomizedSnackbarProvider(props) {
    const classes = useStyles();
    const { info, error, warning, success } = props;
    const Container = (props) => <div>{props.children}</div>;

    const toastMessages = () => {
        if (success) {
            toast.success(
                <Container>
                    <Alert severity="success" variant="filled">
                        {success}
                    </Alert>
                </Container>,
                {
                    className: classes.success,
                }
            );
        }

        if (info) {
            toast.info(
                <Container>
                    <Alert severity="info" variant="filled">
                        {info}
                    </Alert>
                </Container>,
                {
                    className: classes.info,
                }
            );
        }

        if (warning) {
            toast.warn(
                <Container>
                    <Alert severity="warning" variant="filled">
                        {warning}
                    </Alert>
                </Container>,
                {
                    className: classes.warning,
                }
            );
        }

        if (error) {
            toast.error(
                <Container>
                    <Alert severity="error" variant="filled">
                        {error}
                    </Alert>
                </Container>,
                {
                    className: classes.error,
                }
            );
        }
    };

    useEffect(() => {
        if (
            'handleEvent' in props &&
            props.handleEvent &&
            'pushEvent' in props &&
            props.pushEvent
        ) {
            toastMessages();
        } else {
            toastMessages();
        }
    }, []);

    return (
        <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    );
}
