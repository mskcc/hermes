import React, { useState, useEffect, useRef } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { setupTable, paginateList, findMatchParts, randomNumber } from '@/_helpers';
import MaterialTable from 'material-table';
import axios from 'axios';
import Skeleton from '@material-ui/lab/Skeleton';
import Grid from '@material-ui/core/Grid';
import { Chart } from 'react-google-charts';
import Chip from '@material-ui/core/Chip';
import HistogramRangeSlider from '@/_components/HistogramRangeSlider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { purple, blue, cyan, red, amber, orange, pink, grey } from '@material-ui/core/colors';
import TextField from '@material-ui/core/TextField';
import { DateTime, Interval } from 'luxon/src/luxon';
import TablePagination from '@material-ui/core/TablePagination';
import CardHeader from '@material-ui/core/CardHeader';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import { ResponsiveSwarmPlot } from '@nivo/swarmplot';

import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const DEFAULT_START = DateTime.fromFormat('05/01/2020', 'D');
const DEFAULT_END = DateTime.now();
const FILTER_GROUP_LIMIT = 5;

const useStyles = makeStyles(() => ({
    root: {
        width: '100%',
        paddingTop: '10px',
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        textAlign: 'center',
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
    filterCard: {
        height: '100%',
    },
    loadingSpinner: {
        position: 'absolute',
        right: '40px',
    },
    numberElem: {
        width: '100%',
        textAlign: 'left',
    },
}));

const sortTimeLineData = (a, b) => {
    const startIndex = 3;
    const endIndex = 4;
    if (a[startIndex] == b[startIndex]) {
        return b[endIndex] - a[endIndex];
    } else {
        return b[startIndex] - a[startIndex];
    }
};

const sortTableData = (a, b) => {
    if (a['started'] == b['started']) {
        return b['finished'].toMillis() - a['finished'].toMillis();
    } else {
        return b['started'].toMillis() - b['started'].toMillis();
    }
};

const sortJobGroupData = (a, b) => {
    if (a[1]['numProcessing'] == b[1]['numProcessing']) {
        return b[1]['total'] - a[1]['total'];
    } else {
        return b[1]['numProcessing'] - a[1]['numProcessing'];
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

const swarmXValues = {
    Pipeline: [10, 75],
    'Post-pipeline': [80, 90],
};

const XValueToLabel = (Xvalue) => {
    for (const [pipelineName, [rangeMin, rangeMax]] of Object.entries(swarmXValues)) {
        if (rangeMin <= Xvalue && Xvalue <= rangeMax) {
            return pipelineName;
        }
    }
};

const tagToIconAndColor = {
    run: { icon: 'settings', color: purple[100] },
    project: { icon: 'work', color: orange[100] },
    email: { icon: 'email', color: blue[100] },
    sample: { icon: 'science', color: cyan[100] },
};

const timeLineHeader = [
    { type: 'string', id: 'Run' },
    { type: 'string', id: 'Status' },
    { type: 'string', role: 'style' },
    { type: 'date', id: 'Start' },
    { type: 'date', id: 'End' },
];

const runFilteringKeys = {
    app: { title: 'App', color: purple[100] },
    id: { title: 'Id', color: pink[100] },
    job_group: { title: 'Job Group', color: blue[100] },
    name: { title: 'Name', color: amber[100] },
    status: { title: 'Status', color: orange[100] },
    tags: { title: 'Tags', color: cyan[100] },
};

const defaultTagIconAndColor = { icon: 'label', color: amber[100] };

const calculateTimelineHeight = (numRows) => {
    return 41 * numRows + 60;
};

const calculateSwarmHeight = (totalRuns, numJobGroups) => {
    if (totalRuns == 0) {
        return 261;
    }
    return Math.round(totalRuns / 10) * 8 + numJobGroups * 60 + 200;
};

const getStartedAndFinishedTimes = (jobObj) => {
    let startedDate = null;
    let finishedDate = null;
    let pending = false;
    let jobFinished = true;
    const { finished_date, finished, started, submitted_date, created_date } = jobObj;
    for (const singleFinishedDate of [finished_date, finished]) {
        if (!finishedDate || !finishedDate.isValid) {
            finishedDate = DateTime.fromISO(singleFinishedDate);
        }
    }
    if (!finishedDate || !finishedDate.isValid) {
        finishedDate = DEFAULT_END;
        jobFinished = false;
    }
    for (const singleStartedDate of [started, submitted_date, created_date]) {
        if (!startedDate || !startedDate.isValid || startedDate > finishedDate) {
            startedDate = DateTime.fromISO(singleStartedDate);
        }
    }

    if (submitted_date && !started) {
        if (!jobFinished) {
            pending = true;
        }
    }
    if (!startedDate) {
        startedDate = DEFAULT_START;
    }

    return [startedDate, finishedDate, pending];
};

const RunJobs = function (props) {
    const classes = useStyles();
    const { runJobsRoute, rowData } = props;
    const [runJobsLoading, updateRunJobsLoading] = useState(false);
    const [runJobsLoaded, updateRunJobsLoaded] = useState(false);
    const [runJobsTimeLine, updateRunJobsTimeLine] = useState([]);

    const [displayRunJobsTimeLine, updateDisplayRunJobsTimeLine] = useState(false);
    const emptyRunJobListMessage =
        'Hmmm...It looks like there is no stored job information for this run';
    const fetchRunJobs = (runId) => {
        updateRunJobsLoading(true);
        updateRunJobsLoaded(false);
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
                    updateRunJobsLoading(false);
                    updateRunJobsLoaded(true);
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
                    const singleRunInfo = [
                        name,
                        status,
                        color,
                        startedDate.toJSDate(),
                        finishedDate.toJSDate(),
                    ];
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
        const runJobsTimeLineHeight = calculateTimelineHeight(runJobsTimeLine.length);
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
                                variant="subtitle2"
                                style={{ color: statusToColor[status] }}
                            >
                                {status}
                            </Typography>
                        ))}
                </span>

                {runJobsTimeLine.length !== 0 && runJobsLoaded && (
                    <Chart
                        width={'100%'}
                        height={runJobsTimeLineHeight}
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
    const { runList, runJobsRoute, handleEvent, pushEvent } = props;
    const [runs, updateRuns] = useState(runList);
    const [postFilteredRuns, updatePostFilteredRuns] = useState(runList);
    const [runsTableData, updateRunsTableData] = useState([]);
    const [runsTimeLine, updateRunsTimeLine] = useState([]);
    const [paginatedRunsTimeLine, updatePaginatedRunsTimeLine] = useState([]);
    const [runsColumn, updateRunsColumn] = useState([]);
    const [displayRunsTimeLine, updateDisplayRunsTimeLine] = useState(false);
    const [displayJobGroups, updateDisplayJobGroups] = useState(false);
    const [setupRunsTable, updateSetupRunsTable] = useState(true);
    const [runStartDate, updateRunStartDate] = useState(DEFAULT_START);
    const [runEndDate, updateRunEndDate] = useState(DEFAULT_END);
    const [page, updatePage] = React.useState(0);
    const [pageSize, updatePageSize] = React.useState(25);
    const [fakeControls, updateFakeControls] = useState([]);
    const [filterOptions, updateFilterOptions] = useState([]);
    const [recommendation, updateRecommendation] = useState([]);
    const [timeLineHeight, updateTimeLineHeight] = useState(calculateTimelineHeight(pageSize));
    const [loading, updateLoading] = useState(false);
    const [totalRuns, updateTotalRuns] = useState(0);
    const [runningRuns, updateRunningRuns] = useState(0);
    const [pendingRuns, updatePendingRuns] = useState(0);
    const [completedRuns, updateCompletedRuns] = useState(0);
    const [failedRuns, updateFailedRuns] = useState(0);
    const [jobGroupData, updateJobGroupData] = useState({});
    const [jobGroupPage, updateJobGroupPage] = React.useState(0);
    const [jobGroupPageSize, updateJobGroupPageSize] = React.useState(5);
    const [paginatedSwarmData, updatePaginatedSwarmData] = useState([]);
    const [swarmGroups, updateSwarmGroups] = useState([]);
    const [swarmPlotHeight, updateSwarmPlotHeight] = useState(100);
    const loadingRunWidthRow = [1, 3, 5, 3];
    const swarmRef = useRef(null);
    const swarmToolTipWidth = 250;
    const swarmToolTipHeight = 180;

    const loadingRunWidth = Array(8).fill(loadingRunWidthRow).flat();

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
                updateLoading(true);
                pushEvent('fetch');
            }
        }
    }, [runs]);

    useEffect(() => {
        if (swarmGroups.length !== 0) {
            updateDisplayJobGroups(true);
        }
    }, [swarmGroups]);

    const setUp = () => {
        updateRunView(runStartDate, runEndDate, filterOptions, jobGroupPage, page);
        setUpFilters(runs);
    };

    const updateRunView = (start, end, filterOptionsParam, jobGroupPageParam, pageParam) => {
        updateLoading(true);
        const { timeLineData, tableData, jobGroupData } = setupRunData(
            runs,
            start,
            end,
            filterOptionsParam
        );

        updateRunsTableData([]);
        updateRunsTimeLine([]);
        updatePaginatedSwarmData([]);
        setUpSwarmPlot(jobGroupData, jobGroupPageSize, jobGroupPageParam);
        setUpTimeLine(timeLineData, pageSize, pageParam);
        setUpRunTable(tableData);
        updateLoading(false);
    };

    const updateRunTimes = (start, end) => {
        updateRunStartDate(start);
        updateRunEndDate(end);
        updateRunView(start, end, filterOptions, jobGroupPage, page);
    };

    const setUpRunTable = (tableRunDataParam) => {
        const tableRunData = tableRunDataParam.sort(sortTableData);
        const fieldColumnWidth = { name: '800' };
        const runTableIgnore = ['id', 'started', 'ended'];
        const { tableData, tableColumn } = setupTable(
            tableRunData,
            fieldColumnWidth,
            'status',
            runTableIgnore
        );
        updateRunsTableData(tableData);
        updateRunsColumn(tableColumn);
    };

    const filterRun = (allRuns, filterOptionList) => {
        let filteredList = [];
        let groupedFilteredOptions = {};
        if (!filterOptionList || filterOptionList.length === 0) {
            return allRuns;
        }
        if (!allRuns || allRuns.length === 0) {
            return filteredList;
        }
        for (const singleFilerOption of filterOptionList) {
            const { title, field } = singleFilerOption;
            if (!(field in groupedFilteredOptions)) {
                groupedFilteredOptions[field] = [];
            }
            groupedFilteredOptions[field].push(title);
        }
        for (const singleRun of allRuns) {
            let filterRun = false;
            for (const [filterField, filterList] of Object.entries(groupedFilteredOptions)) {
                if (!filterRun) {
                    let foundMatch = false;
                    for (const singleFilterTitle of filterList) {
                        if (filterField.includes('tags:')) {
                            const tagField = filterField.replace('tags:', '');
                            const { tags: { [tagField]: tagValue = null } = {} } = singleRun;
                            if (Array.isArray(tagValue)) {
                                for (const singleListItem of tagValue) {
                                    if (singleListItem && singleListItem === singleFilterTitle) {
                                        foundMatch = true;
                                    }
                                }
                            } else if (tagValue && tagValue === singleFilterTitle) {
                                foundMatch = true;
                            }
                        } else {
                            const { [filterField]: fieldValue = null } = singleRun;
                            if (fieldValue && fieldValue === singleFilterTitle) {
                                foundMatch = true;
                            }
                        }
                    }
                    if (!foundMatch) {
                        filterRun = true;
                    }
                }
            }
            if (!filterRun) {
                filteredList.push(singleRun);
            }
        }
        return filteredList;
    };

    const setUpFilters = (allRuns) => {
        let currentRecommendationList = [];
        let addedRecommendation = {};
        for (const singleRun of allRuns) {
            let sampleRecommendationList = [];
            for (const [filterKey, { title: filterName }] of Object.entries(runFilteringKeys)) {
                const { [filterKey]: runValue = null } = singleRun;

                if (runValue) {
                    if (filterKey === 'tags' && runValue) {
                        for (const [singleKey, singleValue] of Object.entries(runValue)) {
                            if (singleValue) {
                                if (Array.isArray(singleValue)) {
                                    for (const singleListItem of singleValue) {
                                        sampleRecommendationList.push({
                                            title: singleListItem.toString(),
                                            type: `${filterName} - ${singleKey}`,
                                            field: `${filterKey}:${singleKey}`,
                                        });
                                    }
                                } else {
                                    sampleRecommendationList.push({
                                        title: singleValue.toString(),
                                        type: `${filterName} - ${singleKey}`,
                                        field: `${filterKey}:${singleKey}`,
                                    });
                                }
                            }
                        }
                    } else {
                        sampleRecommendationList.push({
                            title: runValue.toString(),
                            type: filterName,
                            field: filterKey,
                        });
                    }
                }
            }

            if (sampleRecommendationList.length > 0) {
                for (const singleRecommendation of sampleRecommendationList) {
                    const { title, field } = singleRecommendation;
                    if (!(field in addedRecommendation)) {
                        addedRecommendation[field] = {};
                    }
                    if (!(title in addedRecommendation[field])) {
                        addedRecommendation[field][title] = null;
                        currentRecommendationList.push(singleRecommendation);
                    }
                }
            }
        }

        currentRecommendationList.sort((a, b) => a['type'].localeCompare(b['type']));
        updateRecommendation(currentRecommendationList);
    };

    const handleChangePage = (event, newPage) => {
        updatePage(newPage);
        setUpTimeLine(runsTimeLine, pageSize, newPage);
    };

    const handleChangeJobGroupPage = (event, newPage) => {
        updateJobGroupPage(newPage);
        setUpSwarmPlot(jobGroupData, jobGroupPageSize, newPage);
    };

    const handleChangePageSize = (event) => {
        const newPageSize = parseInt(event.target.value, 10);
        updatePageSize(newPageSize);
        setUpTimeLine(runsTimeLine, newPageSize, page);
    };

    const handleChangeJobGroupPageSize = (event) => {
        const newPageSize = parseInt(event.target.value, 10);
        updateJobGroupPageSize(newPageSize);
        setUpSwarmPlot(jobGroupData, newPageSize, jobGroupPage);
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

    const setupRunData = (runsParam, timeStart, timeEnd, filterOptions) => {
        const filteredRuns = filterRun(runsParam, filterOptions);
        updatePostFilteredRuns(filteredRuns);
        const timeLineInterval = Interval.fromDateTimes(
            timeStart.startOf('day'),
            timeEnd.endOf('day')
        );
        let timeLineData = [];
        let tableData = [];
        let jobGroupData = {};
        let currentCompletedRuns = 0;
        let currentPendingRuns = 0;
        let currentRunningRuns = 0;
        let currentFailedRuns = 0;

        for (const singleRun of filteredRuns) {
            const { status, name } = singleRun;
            let [startedDate, finishedDate, pending] = getStartedAndFinishedTimes(singleRun);
            if (
                name &&
                status &&
                startedDate &&
                finishedDate &&
                startedDate.isValid &&
                finishedDate.isValid
            ) {
                const runInterval = Interval.fromDateTimes(startedDate, finishedDate);
                if (!timeLineInterval.engulfs(runInterval)) {
                    if (!timeLineInterval.overlaps(runInterval)) {
                        continue;
                    } else {
                        if (startedDate < timeLineInterval.start) {
                            startedDate = timeLineInterval.start;
                        }
                        if (finishedDate > timeLineInterval.end) {
                            finishedDate = timeLineInterval.end;
                        }
                    }
                }
                const {
                    created_date,
                    finished_date,
                    job_group,
                    started,
                    submitted,
                    tags,
                    ...tableRow
                } = singleRun;
                tableRow['started'] = startedDate;
                tableRow['ended'] = finishedDate;
                tableData.push(tableRow);

                let color = statusToColor['UNKNOWN'];
                let statusUpperCase = status.toUpperCase();
                if (pending) {
                    statusUpperCase = 'PENDING';
                }
                if (statusUpperCase in statusToColor) {
                    color = statusToColor[statusUpperCase];
                }
                const singleRunInfo = [
                    name,
                    status,
                    color,
                    startedDate.toJSDate(),
                    finishedDate.toJSDate(),
                ];
                timeLineData.push(singleRunInfo);

                if (!(job_group in jobGroupData)) {
                    jobGroupData[job_group] = {
                        runs: [],
                        request: null,
                        total: 0,
                        numProcessing: 0,
                    };
                }

                if (statusUpperCase === 'COMPLETED') {
                    currentCompletedRuns += 1;
                } else if (statusUpperCase === 'PENDING') {
                    currentPendingRuns += 1;
                    jobGroupData[job_group]['numProcessing'] += 1;
                } else if (statusUpperCase === 'RUNNING') {
                    currentRunningRuns += 1;
                    jobGroupData[job_group]['numProcessing'] += 1;
                } else if (statusUpperCase === 'FAILED') {
                    currentFailedRuns += 1;
                }

                jobGroupData[job_group]['total'] += 1;

                let runType = 'Pipeline';
                if ('argos_run_ids' in tags) {
                    runType = 'Post-pipeline';
                }
                const runIntervalHours = Math.floor(runInterval.length('hours'));
                let runIntervalHoursStr = `${runIntervalHours} Hours`;
                if (runIntervalHours == 1) {
                    runIntervalHoursStr = `${runIntervalHours} Hour`;
                } else if (runIntervalHours < 1) {
                    runIntervalHoursStr = 'Less than an Hour';
                }
                jobGroupData[job_group]['runs'].push([
                    name,
                    runType,
                    status,
                    runInterval.length('hours'),
                    runIntervalHoursStr,
                ]);
                if (!jobGroupData[job_group]['request'] && 'requestId' in tags) {
                    if (tags['requestId']) {
                        jobGroupData[job_group]['request'] = tags['requestId'];
                    }
                }
                if (!jobGroupData[job_group]['request'] && 'project_prefix' in tags) {
                    if (tags['project_prefix']) {
                        jobGroupData[job_group]['request'] = tags['project_prefix'];
                    }
                }
            }
        }

        const totalRuns = timeLineData.length;
        updateTotalRuns(totalRuns);
        updatePendingRuns(currentPendingRuns);
        updateCompletedRuns(currentCompletedRuns);
        updateFailedRuns(currentFailedRuns);
        updateRunningRuns(currentRunningRuns);
        updateJobGroupData(jobGroupData);
        return { timeLineData: timeLineData, tableData: tableData, jobGroupData: jobGroupData };
    };

    const setUpSwarmPlot = (jobGroupData, pageSizeParam, pageParam) => {
        const jobGroupListSorted = Object.entries(jobGroupData).sort(sortJobGroupData);
        const paginatedJobGroup = paginateList(jobGroupListSorted, pageSizeParam, pageParam);
        let currentSwarmData = [];
        let groupList = [];
        let nameDict = {};
        let swarmTotal = 0;
        for (const [jobGroupId, { runs: runList, request, total }] of paginatedJobGroup) {
            let currentRequest = request;
            swarmTotal += total;
            if (!request) {
                currentRequest = 'N/A';
            }
            if (groupList.includes(currentRequest)) {
                let index = 1;
                let newGroupName = `${currentRequest}(${index})`;
                while (groupList.includes(newGroupName)) {
                    index += 1;
                    newGroupName = `${currentRequest}(${index})`;
                }
                currentRequest = newGroupName;
            }
            groupList.push(currentRequest);
            for (const [name, runType, status, duration, durationStr] of runList) {
                const [yMin, yMax] = swarmXValues[runType];
                let jobName = name;
                if (name in nameDict) {
                    let index = 1;
                    let newName = `${name}(${index})`;
                    while (newName in nameDict) {
                        index += 1;
                        newName = `${name}(${index})`;
                    }
                    jobName = newName;
                }
                nameDict[jobName] = null;
                currentSwarmData.push({
                    id: jobName,
                    originalId: name,
                    status: status,
                    duration: duration,
                    durationStr: durationStr,
                    group: currentRequest,
                    originalGroup: request,
                    jobGroupId: jobGroupId,
                    value: randomNumber(yMin, yMax),
                    color: statusToColor[status.toUpperCase()],
                });
            }
        }

        const swarmHeight = calculateSwarmHeight(swarmTotal, jobGroupPageSize);
        updateSwarmPlotHeight(swarmHeight);
        updatePaginatedSwarmData(currentSwarmData);
        updateSwarmGroups(groupList);
    };

    const setUpTimeLine = (timeLineDataParam, pageSizeParam, pageParam) => {
        const timeLineData = timeLineDataParam.sort(sortTimeLineData);

        let paginatedTimeLineData = paginateList(timeLineData, pageSizeParam, pageParam);
        paginatedTimeLineData.unshift(timeLineHeader);
        updateRunsTimeLine(timeLineData);
        updatePaginatedRunsTimeLine(paginatedTimeLineData);
        let newTimeLineHeight = calculateTimelineHeight(pageSizeParam);
        if (timeLineData.length < pageSizeParam) {
            newTimeLineHeight = calculateTimelineHeight(timeLineData.length);
        }

        updateTimeLineHeight(newTimeLineHeight);
        updateFakeControls([]);
    };

    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.root}>
                <Grid direction="row" container spacing={2} justify="space-between">
                    <Grid item xs={3}>
                        <Card className={classes.filterCard}>
                            <CardContent>
                                <Typography
                                    className={classes.title}
                                    color="textSecondary"
                                    gutterBottom
                                >
                                    Filter Runs
                                </Typography>
                                <Autocomplete
                                    disableListWrap
                                    multiple
                                    options={recommendation}
                                    filterOptions={(options, { inputValue }) => {
                                        const singleOption = FILTER_GROUP_LIMIT - 1;
                                        let foundOptions = {
                                            id: singleOption,
                                            job_group: singleOption,
                                            'tags:argos_run_ids': singleOption,
                                            'tags:run_ids': singleOption,
                                        };
                                        let optionList = [];
                                        for (const singleOption of options) {
                                            const { field, title } = singleOption;
                                            const lowerCaseInput = inputValue.toLowerCase();
                                            if (
                                                title.toLowerCase().includes(lowerCaseInput) ||
                                                inputValue === '' ||
                                                field.toLowerCase().includes(lowerCaseInput)
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
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const {
                                                [option.field]: {
                                                    color: tagColor,
                                                } = runFilteringKeys['tags'],
                                            } = runFilteringKeys;

                                            return (
                                                <Chip
                                                    label={option.title}
                                                    key={index}
                                                    style={{
                                                        backgroundColor: tagColor,
                                                    }}
                                                    {...getTagProps({ index })}
                                                />
                                            );
                                        })
                                    }
                                    groupBy={(option) => option['type']}
                                    getOptionLabel={(option) => option['title']}
                                    onChange={(event, newValue) => {
                                        updateFilterOptions(newValue);
                                        updateJobGroupPage(0);
                                        updatePage(0);
                                        updateRunView(runStartDate, runEndDate, newValue, 0, 0);
                                    }}
                                    renderOption={(option, { inputValue }) => {
                                        return findMatchParts(option['title'], inputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id="filter"
                                            label="Status / Id / Pipeline / ...etc"
                                            variant="outlined"
                                            multiline
                                            fullWidth
                                            margin="normal"
                                            name="filter"
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
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <div className={classes.runHistogram}>
                            <HistogramRangeSlider
                                data={runs}
                                filteredData={postFilteredRuns}
                                dateField="created_date"
                                durationStep={'P2D'}
                                onTimeUpdate={updateRunTimes}
                                title="Filter by Date"
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <Card>
                            <CardContent>
                                <Typography
                                    className={classes.title}
                                    color="textSecondary"
                                    gutterBottom
                                >
                                    Run Count
                                </Typography>
                                <div className={classes.numberElem}>
                                    <Typography component="div">
                                        Total:{' '}
                                        <Odometer
                                            value={totalRuns}
                                            format="(,ddd)"
                                            options={{
                                                animation: 'count',
                                            }}
                                        />
                                    </Typography>

                                    <Typography component="div">
                                        Running:{' '}
                                        <Odometer
                                            value={runningRuns}
                                            format="(,ddd)"
                                            options={{
                                                animation: 'count',
                                            }}
                                        />
                                    </Typography>
                                    <Typography component="div">
                                        Pending:{' '}
                                        <Odometer
                                            value={pendingRuns}
                                            format="(,ddd)"
                                            options={{
                                                animation: 'count',
                                            }}
                                        />
                                    </Typography>
                                    <Typography component="div">
                                        Completed:{' '}
                                        <Odometer
                                            value={completedRuns}
                                            format="(,ddd)"
                                            options={{
                                                animation: 'count',
                                            }}
                                        />
                                    </Typography>
                                    <Typography component="div">
                                        Failed:{' '}
                                        <Odometer
                                            value={failedRuns}
                                            format="(,ddd)"
                                            options={{
                                                animation: 'count',
                                            }}
                                        />
                                    </Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        {loading && (
                            <Grid item xs={12}>
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
                            </Grid>
                        )}
                        {!loading && (
                            <Card>
                                <MaterialTable
                                    data={runsTableData}
                                    columns={runsColumn}
                                    key={runsTableData.length}
                                    localization={{
                                        pagination: { labelRowsSelect: 'Runs per page' },
                                    }}
                                    title=""
                                    detailPanel={[
                                        {
                                            icon: function showClosedIcon() {
                                                return <i className="material-icons">assignment</i>;
                                            },
                                            openIcon: function showOpenIcon() {
                                                return (
                                                    <i className="material-icons-outlined">
                                                        assignment
                                                    </i>
                                                );
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
                                                return (
                                                    <i className="material-icons">local_offer</i>
                                                );
                                            },
                                            openIcon: function showOpenIcon() {
                                                return (
                                                    <i className="material-icons-outlined">
                                                        local_offer
                                                    </i>
                                                );
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
                                                            Hmmm...It looks like there are no tags
                                                            associated with this run
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
                                                        return {
                                                            text: tagText,
                                                            tagStyle: tagStyle,
                                                        };
                                                    }

                                                    return null;
                                                };
                                                for (const [tagName, tagValue] of Object.entries(
                                                    tags
                                                )) {
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
                                                        const singleTagObj = createTag(
                                                            tagName,
                                                            tagValue
                                                        );
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
                                    components={{
                                        Container: function createFileContainer(props) {
                                            return <Paper {...props} elevation={0} />;
                                        },
                                    }}
                                    options={{
                                        headerStyle: {
                                            backgroundColor: 'slategrey',
                                            color: '#FFF',
                                        },
                                        padding: 'dense',
                                    }}
                                />
                            </Card>
                        )}
                    </Grid>
                    <Grid item xs={7}>
                        <Card>
                            {!displayRunsTimeLine && (
                                <Skeleton
                                    animation="wave"
                                    height={'30vh'}
                                    variant="rect"
                                ></Skeleton>
                            )}

                            {displayRunsTimeLine && (
                                <span>
                                    <CardHeader
                                        action={
                                            <TablePagination
                                                component="div"
                                                count={runsTimeLine.length}
                                                page={page}
                                                labelRowsPerPage={'Runs per page'}
                                                onChangePage={handleChangePage}
                                                rowsPerPage={pageSize}
                                                onChangeRowsPerPage={handleChangePageSize}
                                            />
                                        }
                                    />
                                    <CardContent>
                                        <span className={classes.timeLinelegend}>
                                            {Object.keys(statusToColor).map((status, index) => (
                                                <Typography
                                                    display="inline"
                                                    key={index}
                                                    variant="subtitle2"
                                                    style={{ color: statusToColor[status] }}
                                                >
                                                    {status}
                                                </Typography>
                                            ))}
                                        </span>
                                    </CardContent>
                                </span>
                            )}
                            {!loading && runsTimeLine.length === 0 && (
                                <Typography component="div">
                                    <Box textAlign="center" p={5}>
                                        Oh no! There are no runs that match your search :(
                                    </Box>
                                </Typography>
                            )}
                            {runsTimeLine.length !== 0 && (
                                <Chart
                                    width={'100%'}
                                    controls={fakeControls}
                                    height={timeLineHeight}
                                    chartType="Timeline"
                                    loader={<div>Loading Chart</div>}
                                    data={paginatedRunsTimeLine}
                                    options={{
                                        timeline: { showBarLabels: false },
                                        hAxis: {
                                            format: 'MM/dd/yy hh:mm',
                                        },
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
                        </Card>
                    </Grid>
                    <Grid item xs={5}>
                        {!displayJobGroups && (
                            <Skeleton animation="wave" height={'30vh'} variant="rect"></Skeleton>
                        )}
                        {displayJobGroups && (
                            <Card
                                className={classes.swarmPlot}
                                ref={swarmRef}
                                style={{
                                    height: swarmPlotHeight,
                                }}
                            >
                                <CardHeader
                                    action={
                                        <TablePagination
                                            component="div"
                                            count={Object.entries(jobGroupData).length}
                                            page={jobGroupPage}
                                            labelRowsPerPage={'Requests per page'}
                                            onChangePage={handleChangeJobGroupPage}
                                            rowsPerPage={jobGroupPageSize}
                                            rowsPerPageOptions={[5, 10, 15, 20]}
                                            onChangeRowsPerPage={handleChangeJobGroupPageSize}
                                        />
                                    }
                                />
                                {!loading && paginatedSwarmData.length == 0 && (
                                    <Typography component="div">
                                        <Box textAlign="center" p={5}>
                                            Hmmm...There are no requests that match your search
                                        </Box>
                                    </Typography>
                                )}
                                {paginatedSwarmData.length !== 0 && (
                                    <ResponsiveSwarmPlot
                                        data={paginatedSwarmData}
                                        groups={swarmGroups}
                                        layout={'horizontal'}
                                        enableGridX={false}
                                        tooltip={(v) => {
                                            const {
                                                node: { x, y },
                                            } = v;
                                            const {
                                                current: { clientHeight, clientWidth },
                                            } = swarmRef;
                                            let left = 0;
                                            let top = 0;
                                            const offset = 100;
                                            if (x + swarmToolTipWidth + offset > clientWidth) {
                                                left =
                                                    clientWidth -
                                                    (x + swarmToolTipWidth) -
                                                    swarmToolTipWidth;
                                            }
                                            if (y + swarmToolTipHeight + offset > clientHeight) {
                                                top =
                                                    clientHeight -
                                                    (y + swarmToolTipHeight) -
                                                    swarmToolTipHeight;
                                            }
                                            return (
                                                <Card
                                                    style={{
                                                        position: 'absolute',
                                                        width: `${swarmToolTipWidth}px`,
                                                        height: `${swarmToolTipHeight}px`,
                                                        left: `${left}px`,
                                                        top: `${top}px`,
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Typography
                                                            variant="subtitle1"
                                                            style={{
                                                                color: v['node']['data']['color'],
                                                            }}
                                                        >
                                                            {v['node']['data']['status']}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {v['node']['data']['originalId']}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Total Runs:{' '}
                                                            {
                                                                jobGroupData[
                                                                    v['node']['data']['jobGroupId']
                                                                ]['total']
                                                            }
                                                        </Typography>

                                                        <Typography variant="body2">
                                                            Duration:{' '}
                                                            {v['node']['data']['durationStr']}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Type:{' '}
                                                            {XValueToLabel(
                                                                v['node']['data']['value']
                                                            )}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            );
                                        }}
                                        forceStrength={4}
                                        simulationIterations={100}
                                        colors={(v) => {
                                            return v['data']['color'];
                                        }}
                                        onMouseEnter={(data, event) => {
                                            event.target.style.fill = 'salmon';
                                        }}
                                        onMouseLeave={(data, event) => {
                                            event.target.style.fill = data['color'];
                                        }}
                                        size={(data) => {
                                            const { duration } = data;
                                            let i = 0;
                                            while (duration > 2 ** i) {
                                                i++;
                                            }
                                            return 6 + i;
                                        }}
                                        borderColor={{
                                            from: 'color',
                                            modifiers: [
                                                ['darker', 0.6],
                                                ['opacity', 0.5],
                                            ],
                                        }}
                                        margin={{ top: 50, right: 50, bottom: 100, left: 100 }}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={null}
                                        motionStiffness={50}
                                        motionDamping={10}
                                    />
                                )}
                            </Card>
                        )}
                    </Grid>
                </Grid>
            </div>
        </Container>
    );
}
