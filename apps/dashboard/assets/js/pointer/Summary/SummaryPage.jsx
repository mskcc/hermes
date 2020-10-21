import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TableFooter from '@material-ui/core/TableFooter';
import PropTypes from 'prop-types';
import { summaryService, authenticationService } from '@/_services';
import { bindActionCreators } from 'redux';
import * as summaryActions from '@/Summary/SummaryActions';
import * as fileActions from '@/Files/FileActions';
import * as filePageActions from '@/Files/FilesPageActions';
import { connect } from 'react-redux';
import Card from '@/_components/Card';
import 'odometer/themes/odometer-theme-default.css';
import Odometer from 'react-odometerjs';
import Typography from '@material-ui/core/Typography';
import { Doughnut } from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import { convertDictToPieData } from '@/_helpers';
const colorConvert = require('color-convert');

const MIN_LABEL_PERCENTAGE = 4;

const mapStateToProps = function (state) {
    return {
        assay: state.summaryReducer.argosAssay,
        oncoTree: state.summaryReducer.oncoTree,
        fileGroups: state.fileReducer.file_groups,
        numRequests: state.filesPageReducer.numRequests,
        numSamples: state.filesPageReducer.numSamples,
        numPooledNormals: state.filesPageReducer.numPooledNormals,
        numDmpBams: state.filesPageReducer.numDmpBams,
        numArgosRequests: state.filesPageReducer.numArgosRequests,
        numArgosSamples: state.filesPageReducer.numArgosSamples,
        distArgosOncoTree: state.filesPageReducer.distArgosOncoTree,
    };
};

const mapDispatchToProps = function (dispatch) {
    return {
        actions: {
            summaryActions: bindActionCreators(summaryActions, dispatch),
            fileActions: bindActionCreators(fileActions, dispatch),
            filePageActions: bindActionCreators(filePageActions, dispatch),
        },
    };
};

const paperHeight = '5vh';

const useStyles = (theme) => ({
    root: {
        display: 'flex',
        height: `calc(100vh - ${theme.spacing(6)}px)`,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'space-between',
    },
    paperElem: {
        height: paperHeight,
        width: paperHeight,
    },
    numberElem: {
        width: '100%',
        textAlign: 'center',
    },
});

class SummaryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            currentUser: authenticationService.currentUserValue,
            sampleDistChart: { data: {} },
        };

        this.getCountByMetadata = this.getCountByMetadata.bind(this);
        this.buildMetaDataQuery = this.buildMetaDataQuery.bind(this);
        this.prepareSampleDist = this.prepareSampleDist.bind(this);
    }

    async componentDidMount() {
        const getAssayTask = this.props.actions.summaryActions.getAssay();
        const getOncoTreeTask = this.props.actions.summaryActions.getOncoTree();
        const getJobGroupTask = this.props.actions.fileActions.getFileGroups();
        await getJobGroupTask;
        this.getCountByMetadata('lims', null, ['requestId'], null, true, 'numRequests');
        this.getCountByMetadata('lims', null, ['sampleId'], null, true, 'numSamples');
        this.getCountByMetadata(
            'pooled-normals',
            null,
            ['runId', 'recipe', 'preservation'],
            null,
            true,
            'numPooledNormals'
        );
        this.getCountByMetadata('dmp-bams', null, null, null, true, 'numDmpBams');
        await getAssayTask;
        let argosAssay = this.props.assay;
        let argos_request_query = this.buildMetaDataQuery('recipe', argosAssay);
        this.getCountByMetadata(
            'lims',
            argos_request_query,
            ['requestId'],
            null,
            true,
            'numArgosRequests'
        );
        this.getCountByMetadata(
            'lims',
            argos_request_query,
            ['sampleId'],
            null,
            true,
            'numArgosSamples'
        );
        const distArgosOncoTreeTask = this.getCountByMetadata(
            'lims',
            argos_request_query,
            null,
            'oncoTreeCode',
            false,
            'distArgosOncoTree'
        );
        await getOncoTreeTask;
        await distArgosOncoTreeTask;
        this.prepareSampleDist();
    }

    prepareSampleDist() {
        let oncoTree = this.props.oncoTree;
        let distArgosOncoTree = this.props.distArgosOncoTree;
        let sampleDist = {};
        let colorDict = {};
        let tissueKey = null;
        let tissueColor = null;
        for (const [key, value] of Object.entries(distArgosOncoTree)) {
            if (!key) {
                tissueKey = 'Unlabeled';
                tissueColor = 'white';
            } else {
                const oncoTreeCode = key.toUpperCase();
                if (!(oncoTreeCode in oncoTree)) {
                    tissueKey = 'Not Found';
                    tissueColor = 'white';
                } else {
                    tissueKey = oncoTree[oncoTreeCode]['tissue'];
                    tissueColor = oncoTree[oncoTreeCode]['color'].toLowerCase();
                }
            }

            if (tissueKey in sampleDist) {
                sampleDist[tissueKey] = sampleDist[tissueKey] + value;
            } else {
                sampleDist[tissueKey] = value;
                colorDict[tissueKey] = '#' + colorConvert.keyword.hex(tissueColor);
            }
        }
        const sampleDistChart = convertDictToPieData({
            dataDict: sampleDist,
            colorDict: colorDict,
        });
        this.setState({
            sampleDistChart: sampleDistChart,
        });
    }

    getCountByMetadata(
        fileGroup,
        metadataIdList,
        valuesMetadata,
        metadataDistribution,
        count,
        stateKey
    ) {
        var fileGroups = this.props.fileGroups;
        var fileGroupId = fileGroups[fileGroup];
        return this.props.actions.filePageActions.loadFilesList({
            file_group: [fileGroupId],
            metadata: metadataIdList,
            values_metadata: valuesMetadata,
            metadata_distribution: metadataDistribution,
            count: count,
            state_key: stateKey,
        });
    }

    buildMetaDataQuery(key, valueList) {
        var queryList = [];
        for (const singleValue of valueList) {
            const singleQuery = key + ':' + singleValue;
            queryList.push(singleQuery);
        }
        return queryList;
    }

    render() {
        const { sampleDistChart } = this.state;
        const {
            assay,
            classes,
            numRequests,
            numArgosRequests,
            numArgosSamples,
            numPooledNormals,
            numDmpBams,
        } = this.props;
        const label_options = {
            plugins: {
                labels: {
                    render: function (args) {
                        if (args.percentage >= MIN_LABEL_PERCENTAGE) {
                            return args.label;
                        }
                    },
                    position: 'outside',
                    textMargin: 8,
                },
            },
            legend: {
                display: false,
            },
        };
        return (
            <div className={classes.root}>
                <Card className={classes.paperElem}>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Number of Requests
                    </Typography>
                    <div className={classes.numberElem}>
                        <Odometer
                            value={numArgosRequests}
                            format="(,ddd).dd"
                            options={{
                                duration: 3000,
                                animation: 'count',
                            }}
                        />
                    </div>
                </Card>
                <Card className={classes.paperElem}>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Number of Samples
                    </Typography>
                    <div className={classes.numberElem}>
                        <Odometer
                            value={numArgosSamples}
                            format="(,ddd).dd"
                            options={{
                                duration: 3000,
                                animation: 'count',
                            }}
                        />
                    </div>
                </Card>
                <Card className={classes.paperElem}>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Number of Pooled Normals
                    </Typography>
                    <div className={classes.numberElem}>
                        <Odometer
                            value={numPooledNormals}
                            format="(,ddd).dd"
                            options={{
                                duration: 3000,
                                animation: 'count',
                            }}
                        />
                    </div>
                </Card>
                <Card className={classes.paperElem}>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Number of DMP Bams
                    </Typography>
                    <div className={classes.numberElem}>
                        <Odometer
                            value={numDmpBams}
                            format="(,ddd).dd"
                            options={{
                                duration: 3000,
                                animation: 'count',
                            }}
                        />
                    </div>
                </Card>
                <Card className={classes.paperElem}>
                    <Doughnut data={sampleDistChart.data} options={label_options} />
                </Card>
                <Card className={classes.paperElem}></Card>
                <Card className={classes.paperElem}></Card>
                <Card className={classes.paperElem}></Card>
                <Card className={classes.paperElem}></Card>
                <Card className={classes.paperElem}></Card>
                <Card className={classes.paperElem}></Card>
                {/*<Paper>
                    <p>Total Requests: {assay} </p>
                    <p>Total Samples: {summary.numSamples} </p>
                    <p>Total Argos Requests: {summary.argosRequests} </p>
                    <p>Total Argos Samples: {summary.argosSamples} </p>
                    <p>Total Pooled Normals: {summary.numPooledNormals} </p>
                    <p>Total DMP Bams: {summary.numDmpBams} </p>
                </Paper>
                */}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(SummaryPage));
