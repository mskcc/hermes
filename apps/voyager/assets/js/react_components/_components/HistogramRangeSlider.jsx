import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Bar } from 'react-chartjs-2';
import { sortDateList } from '@/_helpers';
import Slider from '@material-ui/core/Slider';
import { DateTime, Interval, Duration } from 'luxon/src/luxon';
import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
const useStyles = makeStyles(() => ({
    dateSelection: {
        width: '100%',
    },
    histogram: {
        position: 'relative',
        height: '12vh',
    },
}));

const HOVER_COLOR = 'salmon';
const HISTOGRAM_COLOR = 'lightslategrey';
const HISTOGRAM_SELECTED_COLOR = 'darkslateblue';
const DEFAULT_START = DateTime.fromFormat('05/01/2020', 'D');
const DEFAULT_END = DateTime.now();

const HistogramSlider = withStyles({
    root: {
        color: HISTOGRAM_SELECTED_COLOR,
    },
    rail: {
        color: HISTOGRAM_COLOR,
    },
})(Slider);

export default function HistogramRangeSlider(props) {
    const classes = useStyles();
    const {
        data,
        filteredData,
        dateStart,
        dateEnd,
        durationStep,
        dateField,
        initialSelectedStart,
        initialSelectedEnd,
        title,
        onTimeUpdate,
    } = props;
    const [barData, updateBarData] = useState({});
    const [value, updateValue] = useState([0, 1]);
    const [intervalList, updateIntervalList] = useState([]);
    let initialSelectedStartDate = null;
    let initialSelectedEndDate = null;
    if (initialSelectedStart && DateTime.fromFormat(initialSelectedStart, 'D').isValid) {
        initialSelectedStartDate = DateTime.fromFormat(initialSelectedStart, 'D');
    } else {
        initialSelectedStartDate = DEFAULT_START;
    }
    if (initialSelectedEndDate && DateTime.fromFormat(initialSelectedEnd, 'D').isValid) {
        initialSelectedEndDate = DateTime.fromFormat(initialSelectedEnd, 'D');
    } else {
        initialSelectedEndDate = DEFAULT_END;
    }
    const [selectedStart, updateSelectedStart] = useState(initialSelectedStartDate);
    const [selectedEnd, updateSelectedEnd] = useState(initialSelectedEndDate);
    const [commitedTime, updateCommitedTime] = useState([selectedStart, selectedEnd]);

    const valueLabelFormat = (singleValue) => {
        if (singleValue == value[0]) {
            return selectedStart.toFormat('L/d');
        } else if (singleValue == value[1]) {
            return selectedEnd.toFormat('L/d');
        } else {
            return '';
        }
    };

    const updateHighlightChange = (selectedStartDate, selectedEndDate) => {
        const [backgroundColorList, labelList] = getLabelsAndColors(
            selectedStartDate,
            selectedEndDate,
            intervalList
        );
        const newValue = getSliderValue(selectedStartDate, selectedEndDate, intervalList);
        barData['labels'] = labelList;
        barData['datasets'][0]['backgroundColor'] = backgroundColorList;
        updateBarData(barData);
        updateValue(newValue);
        updateSelectedStart(selectedStartDate);
        updateSelectedEnd(selectedEndDate);
    };

    const handleSliderChange = (event, newValue) => {
        const [selectedStartIndex, selectedEndIndex] = newValue;
        const selectedStartDate = intervalList[selectedStartIndex].start;
        const selectedEndDate = intervalList[selectedEndIndex].start;
        updateHighlightChange(selectedStartDate, selectedEndDate);
    };

    const handleInputDateChange = (startDate, endDate) => {
        if (startDate < endDate) {
            updateHighlightChange(startDate, endDate);
            updateCommitedTime([startDate, endDate]);
        }
    };

    const getLabelsAndColors = (selectedStartDate, selectedEndDate, binIntervals) => {
        let labelList = [];
        let backgroundColorList = [];
        const highlightInterval = Interval.fromDateTimes(
            selectedStartDate.startOf('day'),
            selectedEndDate.endOf('day')
        );
        for (const singleInterval of binIntervals) {
            const label = singleInterval.toFormat('DD');
            let backgroundColor = HISTOGRAM_COLOR;
            if (singleInterval.overlaps(highlightInterval)) {
                backgroundColor = HISTOGRAM_SELECTED_COLOR;
            }
            labelList.push(label);
            backgroundColorList.push(backgroundColor);
        }
        return [backgroundColorList, labelList];
    };

    const getSliderValue = (selectedStartDate, selectedEndDate, binIntervals) => {
        let newValue = [0, 0];

        for (const [index, singleInterval] of binIntervals.entries()) {
            if (singleInterval.contains(selectedStartDate)) {
                newValue[0] = index;
            }

            if (singleInterval.contains(selectedEndDate)) {
                newValue[1] = index;
            }
        }
        const lastInterval = binIntervals[binIntervals.length - 1];
        if (lastInterval.isBefore(selectedEndDate)) {
            newValue[1] = binIntervals.length - 1;
        }

        return newValue;
    };

    const setUp = () => {
        const copiedData = JSON.parse(JSON.stringify(data));
        const copiedFilteredData = JSON.parse(JSON.stringify(filteredData));
        const sortedData = sortDateList(dateField, copiedData);
        const sortedFilteredData = sortDateList(dateField, copiedFilteredData);

        if (sortedData.length !== 0) {
            let historgramStart = sortedData[0]['sortDate'];
            let historgramEnd = sortedData[sortedData.length - 1]['sortDate'];
            if (dateStart) {
                historgramStart = DateTime.fromISO(dateStart);
            }
            if (dateEnd) {
                historgramEnd = DateTime.fromISO(dateEnd);
            }

            const entireInterval = Interval.fromDateTimes(historgramStart, historgramEnd);
            const intervalDuration = Duration.fromISO(durationStep);
            let binIntervals = entireInterval.splitBy(intervalDuration);
            const lastInterval = Interval.fromDateTimes(historgramEnd, historgramEnd);
            binIntervals.push(lastInterval);
            updateIntervalList(binIntervals);

            const [backgroundColorList, labelList] = getLabelsAndColors(
                selectedStart,
                selectedEnd,
                binIntervals
            );

            let sliderStartDate = selectedStart;
            let sliderEndDate = selectedEnd;
            let startInterval = binIntervals[0];
            let endInterval = binIntervals[binIntervals.length - 1];
            if (startInterval.isAfter(sliderStartDate)) {
                sliderStartDate = startInterval.start;
            }

            if (endInterval.isBefore(sliderEndDate)) {
                sliderEndDate = endInterval.end;
            }

            const newValue = getSliderValue(sliderStartDate, sliderEndDate, binIntervals);

            let binData = Array(binIntervals.length).fill(0);

            let currentIntervalIndex = 0;
            for (const singleObj of sortedFilteredData) {
                let added = false;
                const { sortDate } = singleObj;
                while (!added) {
                    if (
                        currentIntervalIndex == 0 &&
                        binIntervals[currentIntervalIndex].isAfter(sortDate)
                    ) {
                        binData[currentIntervalIndex] += 1;
                        added = true;
                    } else if (currentIntervalIndex >= binIntervals.length) {
                        binData[binIntervals.length - 1] += 1;
                        added = true;
                    } else {
                        const currentInterval = binIntervals[currentIntervalIndex];
                        if (currentInterval.contains(sortDate)) {
                            binData[currentIntervalIndex] += 1;
                            added = true;
                        } else {
                            currentIntervalIndex += 1;
                        }
                    }
                }
            }

            const newbarData = {
                labels: labelList,
                datasets: [
                    {
                        backgroundColor: backgroundColorList,
                        hoverBackgroundColor: HOVER_COLOR,
                        data: binData,
                    },
                ],
            };
            updateSelectedStart(sliderStartDate);
            updateSelectedEnd(sliderEndDate);
            updateBarData(newbarData);
            updateValue(newValue);
        }
    };

    const barOptions = {
        responsive: true,
        legend: {
            display: false,
        },
        maintainAspectRatio: false,
        title: {
            display: true,
            text: title,
            fontSize: 16,
        },
        scales: {
            xAxes: [
                {
                    display: false,
                },
            ],
            yAxes: [
                {
                    display: false,
                    ticks: {
                        min: 0,
                    },
                },
            ],
        },
    };

    useEffect(() => {
        onTimeUpdate(commitedTime[0], commitedTime[1]);
    }, [commitedTime]);

    useEffect(() => {
        setUp();
    }, [data, filteredData]);

    const datePickerValueHandler = (singleDate) => {
        if (singleDate.isValid) {
            return singleDate.toFormat('D');
        } else {
            return singleDate;
        }
    };

    return (
        <Grid direction="row" container spacing={1}>
            <Grid item xs={12} className={classes.histogram}>
                <Bar
                    data={barData}
                    options={barOptions}
                    height={null}
                    width={null}
                    className={classes.histogram}
                />
                <HistogramSlider
                    value={value}
                    min={0}
                    step={1}
                    max={intervalList.length - 1}
                    valueLabelFormat={valueLabelFormat}
                    onChange={handleSliderChange}
                    onChangeCommitted={() => {
                        updateCommitedTime([selectedStart, selectedEnd]);
                    }}
                    onMouseUp={() => {
                        updateCommitedTime([selectedStart, selectedEnd]);
                    }}
                    valueLabelDisplay="auto"
                />
            </Grid>
            <Grid item xs={12}>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                    <Grid direction="row" container justify="center" spacing={1}>
                        <Grid item xs={5}>
                            <KeyboardDatePicker
                                variant="inline"
                                disableToolbar
                                inputVariant="outlined"
                                format="MM/dd/yyyy"
                                margin="normal"
                                label="From"
                                value={datePickerValueHandler(selectedStart)}
                                maxDate={datePickerValueHandler(selectedEnd)}
                                maxDateMessage="This date should be before the next date"
                                onChange={(date) => {
                                    updateSelectedStart(date);
                                    if (date.isValid && selectedEnd.isValid) {
                                        handleInputDateChange(date, selectedEnd);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <KeyboardDatePicker
                                variant="inline"
                                disableToolbar
                                inputVariant="outlined"
                                format="MM/dd/yyyy"
                                margin="normal"
                                label="To"
                                value={datePickerValueHandler(selectedEnd)}
                                minDate={datePickerValueHandler(selectedStart)}
                                minDateMessage="This date should be after the previous date"
                                onChange={(date) => {
                                    updateSelectedEnd(date);
                                    if (date.isValid && selectedStart.isValid) {
                                        handleInputDateChange(selectedStart, date);
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </MuiPickersUtilsProvider>
            </Grid>
        </Grid>
    );
}
