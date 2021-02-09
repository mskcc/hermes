import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { setupTable, getColors } from '@/_helpers';
import MaterialTable from 'material-table';
import axios from 'axios';
import { Skeleton } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import { Chart } from 'react-google-charts';
import Chip from '@material-ui/core/Chip';
import { purple, blue, cyan, red, amber, orange, pink, grey } from '@material-ui/core/colors';
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    runMessage: {
        textAlign: 'center',
        padding: '15px',
    },
    timeLinelegend: {
        display: 'flex',
        justifyContent: 'space-evenly',
        padding: '10px',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        minHeight: '100px',
        overflow: 'hidden',
        alignItems: 'center',
    },
    loadingTableHeader: {
        height: '50px',
    },
    loadingTableRow: {
        height: '10px',
    },
}));
const sortTimeLineData = (a, b) => {
    const startIndex = 3;
    const endIndex = 4;
    if (a[endIndex] == b[endIndex]) {
        return b[startIndex] - a[startIndex];
    } else {
        return b[endIndex] - a[endIndex];
    }
};

const statusToColor = {
    CREATED: blue[500],
    READY: orange[500],
    PENDING: amber[500],
    RUNNING: purple[500],
    FAILED: pink[500],
    COMPLETED: cyan[500],
    ABORTED: red[500],
    UNKNOWN: grey[500],
};

const tagToIconAndColor = {
    run: { icon: 'settings', color: purple[100] },
    project: { icon: 'work', color: orange[100] },
    email: { icon: 'email', color: blue[100] },
    sample: { icon: 'science', color: cyan[100] },
};

const defaultTagIconAndColor = { icon: 'label', color: amber[100] };

const getStartedAndFinishedTimes = (jobObj) => {
    let startedDate = null;
    let finishedDate = null;
    let pending = false;
    let jobFinished = false;
    const currentTime = new Date().getTime();
    const { finished_date, finished, started, submitted_date, created_date } = jobObj;
    if (finished_date) {
        finishedDate = Date.parse(finished_date);
        jobFinished = true;
    } else if (finished) {
        finishedDate = Date.parse(finished);
        jobFinished = true;
    } else {
        finishedDate = currentTime;
    }
    if (started && finishedDate > Date.parse(started)) {
        startedDate = Date.parse(started);
    } else if (submitted_date && finishedDate > Date.parse(submitted_date)) {
        startedDate = Date.parse(submitted_date);
        if (!jobFinished) {
            pending = true;
        }
    } else if (created_date && finishedDate > Date.parse(created_date)) {
        startedDate = Date.parse(created_date);
    }

    return [startedDate, finishedDate, pending];
};

const RunJobs = function (props) {
    const classes = useStyles();
    const { runJobsRoute, rowData, handleEvent, pushEvent } = props;
    const [runJobsLoading, updateRunJobsLoading] = useState(false);
    const [runJobsLoaded, updateRunJobsLoaded] = useState(false);
    const [runJobsTimeLine, updateRunJobsTimeLine] = useState([]);
    const [displayRunJobsTimeLine, updateDisplayRunJobsTimeLine] = useState(false);
    const emptyRunJobListMessage =
        'Hmmm...It looks like there is no stored job information for this run';
    const fetchRunJobs = (runId) => {
        updateRunJobsLoaded(false);
        updateRunJobsLoading(true);
        axios
            .get(runJobsRoute, {
                params: {
                    runId: runId,
                },
            })
            .then((response) => {
                if (
                    response.data &&
                    response.data.length !== 0 &&
                    Object.keys(response.data[0]).length !== 0
                ) {
                    setUpRunJobsTimeLine(response.data[0]);
                }
            })
            .finally(() => {
                setTimeout(() => {
                    updateRunJobsLoaded(true);
                    updateRunJobsLoading(false);
                }, 500);
            });
    };
    const setUpRunJobsTimeLine = (runJobs) => {
        let timeLineData = [
            [
                { type: 'string', id: 'Run' },
                { type: 'string', id: 'Status' },
                { type: 'string', role: 'style' },
                { type: 'date', id: 'Start' },
                { type: 'date', id: 'End' },
            ],
        ];

        for (const [status, jobList] of Object.entries(runJobs)) {
            for (const singleJob of jobList) {
                const { job_name, job_id } = singleJob;
                const [startedDate, finishedDate, pending] = getStartedAndFinishedTimes(singleJob);
                if (job_name && job_id && status && startedDate && finishedDate) {
                    const name = `${job_name} [${job_id}]`;
                    let color = statusToColor['UNKNOWN'];
                    let statusUpperCase = status.toUpperCase();
                    if (pending) {
                        statusUpperCase = 'PENDING';
                    }
                    if (statusUpperCase in statusToColor) {
                        color = statusToColor[statusUpperCase];
                    }
                    const singleRunInfo = [name, status, color, startedDate, finishedDate];
                    timeLineData.push(singleRunInfo);
                }
            }
        }
        timeLineData.sort(sortTimeLineData);
        updateRunJobsTimeLine(timeLineData);
    };
    if (!runJobsLoaded && !runJobsLoading) {
        fetchRunJobs(rowData.id);
    }
    if (runJobsTimeLine.length === 0 && runJobsLoaded) {
        return (
            <Typography className={classes.runMessage} variant="subtitle1" gutterBottom>
                {emptyRunJobListMessage}
            </Typography>
        );
    } else {
        return (
            <div className={classes.root}>
                {!displayRunJobsTimeLine && (
                    <Skeleton animation="wave" height={'200px'} variant="rect"></Skeleton>
                )}
                <span className={classes.timeLinelegend}>
                    {displayRunJobsTimeLine &&
                        Object.keys(statusToColor).map((status, index) => (
                            <Typography
                                display="inline"
                                key={index}
                                variant="subtitle1"
                                style={{ color: statusToColor[status] }}
                            >
                                {status}: ▩
                            </Typography>
                        ))}
                </span>

                {runJobsTimeLine.length !== 0 && runJobsLoaded && (
                    <Chart
                        width={'100%'}
                        height={'500px'}
                        chartType="Timeline"
                        loader={<div>Loading Chart</div>}
                        data={runJobsTimeLine}
                        options={{
                            timeline: { showBarLabels: false },
                            hAxis: { format: 'MM/dd/yy hh:mm' },
                        }}
                        chartEvents={[
                            {
                                eventName: 'ready',
                                callback: ({ chartWrapper, google }) => {
                                    updateDisplayRunJobsTimeLine(true);
                                },
                            },
                            {
                                eventName: 'error',
                                callback: ({ errorMessage }) => {
                                    console.log(errorMessage);
                                },
                            },
                        ]}
                    />
                )}
            </div>
        );
    }
};

export default function RunPage(props) {
    const classes = useStyles();
    const runListDaysAgo = 15;
    const { runList, runJobsRoute, handleEvent, pushEvent } = props;
    const [runs, updateRuns] = useState(runList);

    const [runsTableData, updateRunsTableData] = useState([]);
    const [runsTimeLine, updateRunsTimeLine] = useState([]);
    const [runsColumn, updateRunsColumn] = useState([]);
    const [jobGroupData, updateJobGroupData] = useState([]);
    const [jobGroupColors, updateJobGroupColors] = useState([]);
    const [displayRunsTimeLine, updateDisplayRunsTimeLine] = useState(false);
    const [displayJobGroup, updateDisplayJobGroup] = useState(false);
    const [setupRunsTable, updateSetupRunsTable] = useState(true);
    const loadingRunWidthRow = [1, 3, 5, 3];
    const loadingRunWidth = [
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
        ...loadingRunWidthRow,
    ];

    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;

    useEffect(() => {
        if (handleEvent && pushEvent) {
            if (runs && runs.length !== 0 && setupRunsTable) {
                setUp();
                updateSetupRunsTable(false);
            } else if (runs.length == 0 && runList.length != 0) {
                updateRuns(runList);
            } else {
                pushEvent('fetch');
            }
        }
    }, [runs]);

    const setUp = () => {
        setUpRunTable();
        setUpTimeLineData(runListDaysAgo);
        setUpJobGroupData(runListDaysAgo);
    };

    const setUpRunTable = () => {
        const fieldColumnWidth = { name: '800' };
        const runTableIgnore = ['id'];
        const trimmedRunsData = runs.map(
            ({ created_date, finished_date, job_group, started, submitted, tags, ...tableRow }) =>
                tableRow
        );
        const { tableData, tableColumn } = setupTable(
            trimmedRunsData,
            fieldColumnWidth,
            'status',
            runTableIgnore
        );
        updateRunsTableData(tableData);
        updateRunsColumn(tableColumn);
    };

    const getJobGroupColors = (jobGroupData) => {
        let requestIndex = {};
        let index = 0;
        let statusIndex = {};
        let firstElement = false;
        for (const singleJobGoupObj of jobGroupData) {
            if (!firstElement) {
                firstElement = true;
                continue;
            }
            const [requestId, status] = singleJobGoupObj;
            if (!(requestId in requestIndex)) {
                requestIndex[requestId] = index;
                index += 1;
            }
            if (!(status in statusIndex)) {
                let color = statusToColor['UNKNOWN'];
                const upperCaseStatus = status.toUpperCase();
                if (upperCaseStatus in statusToColor) {
                    color = statusToColor[upperCaseStatus];
                }
                statusIndex[status] = { index: index, color: color };
                index += 1;
            }
        }
        let colorList = [...Array(index)];
        let requestColors = getColors(Object.keys(requestIndex).length);
        for (const [, requestColorIndex] of Object.entries(requestIndex)) {
            colorList[requestColorIndex] = requestColors.pop();
        }
        for (const [, statusColorIndex] of Object.entries(statusIndex)) {
            colorList[statusColorIndex['index']] = statusColorIndex['color'];
        }
        updateJobGroupColors(colorList);
    };

    const setUpJobGroupData = (daysAgo) => {
        let jobGroupData = [
            [
                { type: 'string', id: 'Request' },
                { type: 'string', id: 'Status' },
                { type: 'number', id: 'Runs' },
                { type: 'string', role: 'tooltip' },
            ],
        ];
        let jobGroupToRequestId = {};
        let daysAgoTime = 0;
        if (daysAgo) {
            daysAgoTime = Date.now() - 86400000 * daysAgo;
        }
        for (const singleRun of runs) {
            const { job_group, tags } = singleRun;
            const { requestId } = tags;
            if (requestId) {
                jobGroupToRequestId[job_group] = requestId;
            }
        }
        for (const singleRun of runs) {
            const { job_group, status, name } = singleRun;
            const [, finishedDate] = getStartedAndFinishedTimes(singleRun);
            if (daysAgoTime > finishedDate) {
                continue;
            }
            if (job_group && status && name) {
                const runDisplay = `[${status}] ${name}`;
                let jobRequestId = 'No Request Id';
                if (job_group in jobGroupToRequestId) {
                    jobRequestId = jobGroupToRequestId[job_group];
                }
                const singleRunInfo = [jobRequestId, status, 1, runDisplay];
                jobGroupData.push(singleRunInfo);
            }
        }
        getJobGroupColors(jobGroupData);
        updateJobGroupData(jobGroupData);
    };

    const getRun = (runId) => {
        for (const singleRun of runs) {
            if (singleRun.id == runId) {
                return singleRun;
            }
        }
        return null;
    };

    const checkTagType = (tagName) => {
        for (const tagSearch of Object.keys(tagToIconAndColor)) {
            if (tagName.toLowerCase().includes(tagSearch.toLowerCase())) {
                return tagToIconAndColor[tagSearch];
            }
        }

        return null;
    };

    const setUpTimeLineData = (daysAgo) => {
        let timeLineData = [
            [
                { type: 'string', id: 'Run' },
                { type: 'string', id: 'Status' },
                { type: 'string', role: 'style' },
                { type: 'date', id: 'Start' },
                { type: 'date', id: 'End' },
            ],
        ];
        let daysAgoTime = 0;
        if (daysAgo) {
            daysAgoTime = Date.now() - 86400000 * daysAgo;
        }
        for (const singleRun of runs) {
            const { status, name } = singleRun;
            const [startedDate, finishedDate, pending] = getStartedAndFinishedTimes(singleRun);
            if (daysAgoTime > finishedDate) {
                continue;
            }

            if (name && status && startedDate && finishedDate) {
                let started = startedDate;
                if (startedDate < daysAgoTime) {
                    started = daysAgoTime;
                }
                let color = statusToColor['UNKNOWN'];
                let statusUpperCase = status.toUpperCase();
                if (pending) {
                    statusUpperCase = 'PENDING';
                }
                if (statusUpperCase in statusToColor) {
                    color = statusToColor[statusUpperCase];
                }
                const singleRunInfo = [name, status, color, started, finishedDate];
                timeLineData.push(singleRunInfo);
            }
        }
        timeLineData.sort(sortTimeLineData);
        updateRunsTimeLine(timeLineData);
    };

    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.root}>
                {!runsTableData ||
                    (runsTableData.length == 0 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Skeleton
                                    animation="wave"
                                    variant="rect"
                                    className={classes.loadingTableHeader}
                                ></Skeleton>
                            </Grid>
                            {loadingRunWidth.map(function (value, index) {
                                return (
                                    <Grid item xs={value} key={index}>
                                        <Skeleton
                                            animation="wave"
                                            variant="rect"
                                            className={classes.loadingTableRow}
                                        ></Skeleton>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ))}
                {runsTableData && runsTableData.length != 0 && (
                    <MaterialTable
                        data={runsTableData}
                        columns={runsColumn}
                        title=""
                        detailPanel={[
                            {
                                icon: function showClosedIcon() {
                                    return <i className="material-icons">assignment</i>;
                                },
                                openIcon: function showOpenIcon() {
                                    return <i className="material-icons-outlined">assignment</i>;
                                },
                                tooltip: 'Show Jobs',
                                render: function showJobPanel(rowData) {
                                    return (
                                        <RunJobs
                                            rowData={rowData}
                                            runJobsRoute={runJobsRoute}
                                        ></RunJobs>
                                    );
                                },
                            },
                            {
                                icon: function showClosedIcon() {
                                    return <i className="material-icons">local_offer</i>;
                                },
                                openIcon: function showOpenIcon() {
                                    return <i className="material-icons-outlined">local_offer</i>;
                                },
                                tooltip: 'Show Tags',
                                render: function showTags(rowData) {
                                    const run = getRun(rowData.id);
                                    const tags = run['tags'];
                                    let tagObjList = [];
                                    if (!tags || tags.length === 0) {
                                        return (
                                            <Typography
                                                className={classes.runMessage}
                                                variant="subtitle1"
                                                gutterBottom
                                            >
                                                Hmmm...It looks like there are no tags associated
                                                with this run
                                            </Typography>
                                        );
                                    }
                                    const createTag = (tagName, tagValue) => {
                                        if (typeof tagValue === 'string') {
                                            let tagStyle = checkTagType(tagName);
                                            if (!tagStyle) {
                                                tagStyle = defaultTagIconAndColor;
                                            }
                                            const tagText = `${tagName} - ${tagValue}`;
                                            return { text: tagText, tagStyle: tagStyle };
                                        }

                                        return null;
                                    };
                                    for (const [tagName, tagValue] of Object.entries(tags)) {
                                        if (Array.isArray(tagValue)) {
                                            for (const singleTagValue of tagValue) {
                                                const singleTagListObj = createTag(
                                                    tagName,
                                                    singleTagValue
                                                );
                                                if (singleTagListObj) {
                                                    tagObjList.push(singleTagListObj);
                                                }
                                            }
                                        } else {
                                            const singleTagObj = createTag(tagName, tagValue);
                                            if (singleTagObj) {
                                                tagObjList.push(singleTagObj);
                                            }
                                        }
                                    }

                                    return (
                                        <span className={classes.tags}>
                                            {tagObjList.map((tagObj, index) => (
                                                <Chip
                                                    key={index}
                                                    icon={
                                                        <i className="material-icons">
                                                            {tagObj['tagStyle']['icon']}
                                                        </i>
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            tagObj['tagStyle']['color'],
                                                    }}
                                                    label={tagObj['text']}
                                                />
                                            ))}
                                        </span>
                                    );
                                },
                            },
                        ]}
                        //components={{
                        //    Container: function createFileContainer(props) {
                        //        return <Paper {...props} elevation={0} />;
                        //    },
                        //}}
                        options={{
                            headerStyle: {
                                backgroundColor: 'slategrey',
                                color: '#FFF',
                            },
                            padding: 'dense',
                        }}
                    />
                )}
                <br />
                <Paper elevation={2}>
                    {!displayRunsTimeLine && (
                        <Skeleton animation="wave" height={'30vh'} variant="rect"></Skeleton>
                    )}

                    {displayRunsTimeLine && (
                        <span className={classes.timeLinelegend}>
                            {Object.keys(statusToColor).map((status, index) => (
                                <Typography
                                    display="inline"
                                    key={index}
                                    variant="subtitle1"
                                    style={{ color: statusToColor[status] }}
                                >
                                    {status}: ▩
                                </Typography>
                            ))}
                        </span>
                    )}
                    {runsTimeLine.length !== 0 && (
                        <Chart
                            //width={'1000px'}
                            //height={'300px'}
                            chartType="Timeline"
                            loader={<div>Loading Chart</div>}
                            data={runsTimeLine}
                            options={{
                                timeline: { showBarLabels: false },
                                hAxis: { format: 'MM/dd/yy hh:mm' },
                            }}
                            chartEvents={[
                                {
                                    eventName: 'ready',
                                    callback: ({ chartWrapper, google }) => {
                                        updateDisplayRunsTimeLine(true);
                                    },
                                },
                                {
                                    eventName: 'error',
                                    callback: ({ errorMessage }) => {
                                        console.log(errorMessage);
                                    },
                                },
                            ]}
                        />
                    )}
                </Paper>
                <br />
                <Paper elevation={2}>
                    {!displayJobGroup && (
                        <Skeleton animation="wave" height={'30vh'} variant="rect"></Skeleton>
                    )}
                    {jobGroupData.length !== 0 && (
                        <Chart
                            //width={600}
                            height={'1000px'}
                            chartType="Sankey"
                            loader={<div>Loading Chart</div>}
                            data={jobGroupData}
                            options={{
                                sankey: {
                                    node: {
                                        colors: jobGroupColors,
                                    },
                                },
                            }}
                            chartEvents={[
                                {
                                    eventName: 'ready',
                                    callback: ({ chartWrapper, google }) => {
                                        updateDisplayJobGroup(true);
                                    },
                                },
                                {
                                    eventName: 'error',
                                    callback: ({ errorMessage }) => {
                                        console.log(errorMessage);
                                    },
                                },
                            ]}
                        />
                    )}
                </Paper>
            </div>
        </Container>
    );
}
