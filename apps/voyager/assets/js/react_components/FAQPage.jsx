import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
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
    registrationText: {
        textAlign: 'center',
    },
}));

export default function FaqPage(props) {
    const classes = useStyles();
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.paper}>
                <Typography variant="h5" gutterbottom>
                    How do I register for an account?
                </Typography>
                <Typography gutterbottom>
                    To register for an account, please submit a request here. A member of CI will
                    review your request. You will receive an email once your request has been
                    approved.
                </Typography>
                <br></br>
                <Typography variant="h5" gutterbottom>
                    How often is the information on this website updated?
                </Typography>
                <Typography gutterbottom>
                    The information on hermes is updated in real time.
                </Typography>
                <br></br>
                <Typography variant="h5" gutterbottom>
                    Why does a project not show up?
                </Typography>
                <Typography gutterbottom>
                    Hermes displays the status of projects to be analyzed by the CMO Analysis
                    Support (CAS) team. Projects not analyzed by CAS will not appear here. Other
                    reasons a project may not show up:{' '}
                    <ul>
                        <li>
                            Has the project completed sequencing? Hermes displays the status of
                            projects once sequencing has been completed.
                        </li>
                        <li>
                            Check that you are searching by project ID, and not by IGO sequencing
                            ID.{' '}
                        </li>
                    </ul>
                    If your project meets the above criteria and does not appear on hermes, email us
                    at zzPDL_CMO_CI@mskcc.org.
                </Typography>
                <br></br>
                <Typography variant="h5" gutterbottom>
                    Why did the status of my project change from “Results being reviewed” to
                    “Pipeline running”?
                </Typography>
                <Typography gutterbottom>
                    The CMO Analysis Support team reviews projects before formal delivery.
                    Sometimes, a project may need to be rerun before being delivered.
                </Typography>
                <br></br>
                <Typography variant="h5">
                    I have a question that isn’t answered here. How do I contact you?
                </Typography>
                <Typography gutterbottom>Email us at zzPDL_CMO_CI@mskcc.org.</Typography>
            </div>
        </Container>
    );
}
