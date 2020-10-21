import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TableFooter from '@material-ui/core/TableFooter';

import {bindActionCreators} from "redux";
import * as runsPageActions from "@/Run/RunsPageActions";
import {connect} from "react-redux";


const mapStateToProps = function (state) {
    return {
        runs_list: state.runsPageReducer.runs_list,
    }
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators(runsPageActions, dispatch);
};

class RunsPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            runs: {
                "results" : [],
                "previous": null,
                "next": null,
                "count": 0
            }
        };
        this.loadPage = this.loadPage.bind(this);
        this.editRun = this.editRun.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
    }

    componentDidMount() {
        this.loadPage();
        this.props.getRuns(1);
    }

    loadPage() {
        this.props.getRuns(1);
    }

    editRun(event) {
        this.props.history.push("/run/" + event)
    }

    nextPage(event) {
        this.state.currentPage = this.state.currentPage + 1;
        this.props.getRuns(this.state.currentPage)
    }

    previousPage(event) {
        this.state.currentPage = this.state.currentPage - 1;
        this.loadPage(this.state.currentPage)
    }

    render() {
        if (!this.props.runs_list) {
            return (<div>Loading Runs</div>);
        }

        const { runs_list } = this.props;
        return (
            <div>
                <Paper>
                    <Table className="table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">RunId</TableCell>
                                <TableCell align="left">Run Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="left">Created at</TableCell>
                                <TableCell align="left">Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {runs_list.results.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        {row.id}
                                    </TableCell>
                                    <TableCell>
                                        {row.name}
                                    </TableCell>
                                    <TableCell>
                                        {row.status}
                                    </TableCell>
                                    <TableCell>
                                        {row.created_date}
                                    </TableCell>
                                    <TableCell>
                                    <Button variant="contained" disabled={row.status != "CREATING"} onClick={() => this.editRun(row.id)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>
                                <Button align="center" variant="contained" disabled={runs_list.previous == null} onClick={this.previousPage}>
                                    Previous
                                </Button>
                                </TableCell>
                                <TableCell align="center">
                                    Page: {this.state.currentPage}
                                </TableCell>
                                <TableCell align="right">
                                <Button variant="contained" disabled={runs_list.next == null} onClick={this.nextPage}>
                                    Next
                                </Button>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>
            </div>
        );
    }

}


const ConnectedRunsPage = connect(mapStateToProps, mapDispatchToProps)(RunsPage);
export default ConnectedRunsPage