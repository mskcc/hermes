import React from "react"
import { connect } from "react-redux"
import { bindActionCreators } from 'redux';
import update from 'immutability-helper';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TableFooter from '@material-ui/core/TableFooter';

import * as pipelinePageActions from '@/PipelinePage/PipelinePageActions.jsx';
import * as runsPageActions from '@/Run/RunsPageActions';
import { runService, pipelineService, authenticationService } from '@/_services';


const mapStateToProps = function (state) {
    return {
        pipelines: state.pipelinePageReducer.pipelines,
    }
};

const mapDispatchToProps = function (dispatch) {
    const mergedActions = update(pipelinePageActions, {$merge: runsPageActions});
    return bindActionCreators(mergedActions, dispatch);
};


class PipelinePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            currentUser: authenticationService.currentUserValue,
            pipelines: {
                "results" : [],
                "previous": null,
                "next": null,
                "count": 0
            }
        };
        this.loadPage = this.loadPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.downloadCWL = this.downloadCWL.bind(this);
        this.startRun = this.startRun.bind(this);
    }

    componentDidMount() {
        setTimeout(this.loadPage, 1000);
    }

    loadPage() {
        this.props.getPage(this.state.currentPage);
    }

    nextPage(event) {
        this.state.currentPage = this.state.currentPage + 1;
        this.loadPage(this.state.currentPage)
    }

    previousPage(event) {
        this.state.currentPage = this.state.currentPage - 1;
        this.loadPage(this.state.currentPage)
    }

    downloadCWL(event) {
        pipelineService.downloadCWL(event.id, event.entrypoint);
    }

    startRun(event) {
        // todo: where to obtain second param request_id?
        this.props.createRun(event.id, 'DUMMY')
            .then(run => {
                this.props.history.push("/run/" + run.id);
            });
    }

    render() {
        if (!this.props.pipelines) {
            return (<div>Loading Pipelines</div>);
        }

        const { pipelines } = this.props;
        return (
            <div>
                <Paper>
                    <Table className="table">
                        <TableHead>
                        <TableRow>
                            <TableCell align="left">Pipeline Name</TableCell>
                            <TableCell align="left">github</TableCell>
                            <TableCell align="left">Version</TableCell>
                            <TableCell align="left">Entrypoint</TableCell>
                            <TableCell align="left">Download</TableCell>
                            <TableCell align="left">Run</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {pipelines.results.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        {row.name}
                                    </TableCell>
                                    <TableCell>
                                        {row.github}
                                    </TableCell>                            
                                    <TableCell>
                                        {row.version}
                                    </TableCell>
                                    <TableCell>
                                        {row.entrypoint}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="contained" onClick={() => this.downloadCWL(row)}>Download</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="contained" onClick={() => this.startRun(row)}>Run</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>
                                <Button align="left" variant="contained" disabled={pipelines.previous == null} onClick={this.previousPage}>
                                    Previous
                                </Button>
                                </TableCell>
                                <TableCell align="center">
                                    Page: {this.state.currentPage}
                                </TableCell>
                                <TableCell>
                                </TableCell>
                                <TableCell align="right">
                                <Button variant="contained" disabled={pipelines.next == null} onClick={this.nextPage}>
                                    Next
                                </Button>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>
            </div>
        )
    }

}

const ConnectedPipelinePage = connect(mapStateToProps, mapDispatchToProps)(PipelinePage);
export default ConnectedPipelinePage