import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';

import { fileService, authenticationService } from '@/_services';


class FilePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            previous: false,
            next: false,
            currentPage: 1,
            currentUser: authenticationService.currentUserValue,
            files: {"results": [
            ]},
            selected: {
            }
        }
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.saveDialog = this.saveDialog.bind(this);
    }

    componentDidMount() {
        this.loadPage();
    }

    componentWillMount() {
        this.selected = new Set();
    }

    loadPage() {
        fileService.getPage(this.state.currentPage).then(files => this.setState({ files }));
    }

    nextPage(event) {
        this.state.currentPage = this.state.currentPage + 1;
        this.loadPage()
    }

    previousPage(event) {
        this.state.currentPage = this.state.currentPage - 1;
        this.loadPage()
    }

    handleChange(id) {
        var data = this.state.selected
        for (var key in data) {
            delete data[id];
        }
        if (id in data) {
            data = delete data[id];
        } else {
            data[id] = true;
        }
        this.setState({selected: data})
    }

    saveDialog() {
        var result = this.state.selected
        this.setState({ selected : {} });
        this.props.parent.saveFilePicker(result)
    }

    closeDialog() {
        event.preventDefault();
        this.setState({ selected : {} });
        this.props.parent.closeFilePicker();
    }

    render() {
        const { currentPage, currentUser, files } = this.state;
        return (
            <Dialog fullWidth='true' maxWidth='xl' aria-labelledby="simple-dialog-title" open={this.props.open}>
                <DialogTitle id="simple-dialog-title">Dialog</DialogTitle>
                <Paper className="root">
                <Table className="table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Select</TableCell>
                        <TableCell>Files</TableCell>
                        <TableCell align="left">Sample Id</TableCell>
                        <TableCell align="left">Request Id</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.results.map(row => (
                            <TableRow key={row.id}>
                                <TableCell>
                                <Checkbox
                                    key={row.id}
                                    onClick={e => this.handleChange(row.id)}
                                    checked={this.state.selected[row.id]}
                                    color="default"
                                />
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.file_name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.sample_id}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.request_id}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                        <TableCell>
                        <Button align="left" variant="contained" disabled={files.previous == null} onClick={this.previousPage}>
                            Previous
                        </Button>
                        </TableCell>
                        <TableCell align="center">
                            Page: {this.state.currentPage}
                        </TableCell>
                        <TableCell>
                        </TableCell>
                        <TableCell align="right">
                        <Button variant="contained" disabled={files.next == null} onClick={this.nextPage}>
                            Next
                        </Button>
                        </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                </Paper>
                <Button variant="contained" disabled={files.next == null} onClick={this.saveDialog}>
                            Select
                </Button>
                <Button variant="contained" disabled={files.next == null} onClick={this.closeDialog}>
                            Cancel
                </Button>
            </Dialog>
        );
    }
}

export { FilePicker };