import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import { convertDictToPieData } from '@/_helpers';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Doughnut } from 'react-chartjs-2';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

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
    cardText: {
        padding: 'inherit',
        textAlign: 'center',
    },
}));

export default function DashboardPage(props) {
    const classes = useStyles();
    console.log(props);
    const {
        handleEvent,
        pushEvent,
        samplesCompleted,
        samplesCompletedAssayBreakdown,
        samplesCompletedTOrNBreakdown,
        samplesConnectedToClinical,
        samplesInProcess,
        samplesProcessAssayBreakdown,
    } = props;
    const [samplesCompletedCount, updateSamplesCompletedCount] = useState(0);
    const [samplesInProcessCount, updateSamplesInProcessCount] = useState(0);
    const [samplesConnectedToClinicalCount, updateSamplesConnectedToClinicalCount] = useState(0);
    const [samplesCompletedAssayChartData, updateSamplesCompletedAssayChartData] = useState(null);
    const [samplesCompletedTorNChartData, updateSamplesCompletedTorNChartData] = useState(null);
    const [samplesInProcessChartData, updateSamplesInProcessChartData] = useState(null);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    useEffect(() => {
        if (handleEvent && pushEvent) {
            console.log('loaded');
            updateSamplesCompletedCount(samplesCompleted);
            updateSamplesInProcessCount(samplesInProcess);
            updateSamplesConnectedToClinicalCount(samplesConnectedToClinical);
            updateSamplesCompletedAssayChartData(
                convertDictToPieData({
                    dataDict: samplesCompletedAssayBreakdown,
                })
            );
            updateSamplesCompletedTorNChartData(
                convertDictToPieData({
                    dataDict: samplesCompletedTOrNBreakdown,
                })
            );
            updateSamplesInProcessChartData(
                convertDictToPieData({
                    dataDict: samplesProcessAssayBreakdown,
                })
            );
        }
    }, [samplesCompleted, samplesInProcess, samplesConnectedToClinical]);

    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.paper}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Card>
                            <CardHeader
                                avatar={
                                    <Avatar>
                                        <i className="material-icons">lock_outline</i>
                                    </Avatar>
                                }
                                title="Samples Delivered"
                                subheader="Breakdown of the samples CMO Informatics has delivered"
                                titleTypographyProps={{ variant: 'h5', align: 'left' }}
                            ></CardHeader>
                            <CardContent>
                                <Typography variant="h4" className={classes.cardText} gutterBottom>
                                    <Odometer
                                        value={samplesCompletedCount}
                                        format="(,ddd)"
                                        options={{
                                            animation: 'count',
                                        }}
                                    />{' '}
                                    samples delivered
                                </Typography>
                                <Typography variant="h5" className={classes.cardText}>
                                    Breakdown by Assay
                                </Typography>
                                {samplesCompletedAssayChartData && (
                                    <Doughnut
                                        data={samplesCompletedAssayChartData.data}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                            },
                                        }}
                                    ></Doughnut>
                                )}
                                <Typography variant="h5" className={classes.cardText}>
                                    Breakdown by Tumor or Normal
                                </Typography>
                                {samplesCompletedTorNChartData && (
                                    <Doughnut
                                        data={samplesCompletedTorNChartData.data}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                            },
                                        }}
                                    ></Doughnut>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid
                            container
                            spacing={3}
                            direction="column"
                            justifyContent="space-between"
                        >
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader
                                        avatar={
                                            <Avatar>
                                                <i className="material-icons">lock_outline</i>
                                            </Avatar>
                                        }
                                        title="Samples in Progress"
                                        subheader="Breakdown of the samples in process at CMO Informatics"
                                        titleTypographyProps={{ variant: 'h5', align: 'left' }}
                                    ></CardHeader>
                                    <CardContent>
                                        <Typography
                                            variant="h4"
                                            className={classes.cardText}
                                            gutterBottom
                                        >
                                            <Odometer
                                                value={samplesInProcessCount}
                                                format="(,ddd)"
                                                options={{
                                                    animation: 'count',
                                                }}
                                            />{' '}
                                            samples in process
                                        </Typography>
                                        <Typography variant="h5" className={classes.cardText}>
                                            Breakdown by Assay
                                        </Typography>
                                        {samplesInProcessChartData && (
                                            <Doughnut
                                                data={samplesInProcessChartData.data}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        },
                                                    },
                                                }}
                                            ></Doughnut>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader
                                        avatar={
                                            <Avatar>
                                                <i className="material-icons">lock_outline</i>
                                            </Avatar>
                                        }
                                        title="Samples Stats"
                                        subheader="Statistics of samples handled by CMO Informatics"
                                        titleTypographyProps={{ variant: 'h5', align: 'left' }}
                                    ></CardHeader>
                                    <CardContent>
                                        <Typography variant="h4" className={classes.cardText}>
                                            <Odometer
                                                value={samplesConnectedToClinicalCount}
                                                format="(,ddd)"
                                                options={{
                                                    animation: 'count',
                                                }}
                                            />{' '}
                                            samples have a corresponding clinical sample
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </Container>
    );
}
