import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as filesPageActions from './FilesPageActions';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import Box from '@material-ui/core/Box';

const mapStateToProps = function (state) {
    return {
        files_list: state.filesPageReducer.files_list,
    };
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators(filesPageActions, dispatch);
};

class FilesPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
        };
    }

    componentWillMount() {
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.fileDetails = this.fileDetails.bind(this);
        this.updateFileGroupSearch = this.updateFileGroupSearch.bind(this);
        this.updateFileTypeSearch = this.updateFileTypeSearch.bind(this);
        this.updateMetadataSearch = this.updateMetadataSearch.bind(this);
        this.updateFileNameSearch = this.updateFileNameSearch.bind(this);
        this.updateFileNameRegexSearch = this.updateFileNameRegexSearch.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        this.props.loadFilesList(1);
    }

    nextPage(event) {
        this.state.currentPage = this.state.currentPage + 1;
        this.props.loadFilesList(this.state.currentPage);
    }

    previousPage(event) {
        this.state.currentPage = this.state.currentPage - 1;
        this.props.loadFilesList(this.state.currentPage);
    }

    fileDetails(event) {
        this.props.history.push('/file/' + event);
    }

    updateFileGroupSearch(event) {
        this.setState({ file_group_search: event.target.value });
    }

    updateFileTypeSearch(event) {
        this.setState({ file_type_search: event.target.value });
    }

    updateMetadataSearch(event) {
        this.setState({ metadata_search: event.target.value });
    }

    updateFileNameSearch(event) {
        this.setState({ file_name_search: event.target.value });
    }

    updateFileNameRegexSearch(event) {
        this.setState({ file_name_regex_search: event.target.value });
    }

    search(event) {
        this.setState({ currentPage: 1 });
        this.props.loadFilesList(
            this.state.currentPage,
            this.state.file_group_search,
            this.state.file_type_search,
            this.state.metadata_search,
            this.state.file_name_search,
            this.state.file_name_regex_search
        );
        this.setState({
            file_group_search: '',
            file_type_search: '',
            metadata_search: '',
            file_name_search: '',
            file_name_regex_search: '',
        });
    }

    render() {
        if (!this.props.files_list) {
            return <div>Loading Files</div>;
        }

        const {
            files_list,
            file_group_search,
            file_type_search,
            metadata_search,
            file_name_search,
            file_name_regex_search,
        } = this.props;

        return (
            <div>
                <Box display="flex" justifyContent="space-between">
                    <TextField
                        disabled
                        id="disabled"
                        label="Search: "
                        style={{ width: 100 }}
                        margin="normal"
                    />
                    <TextField
                        id="outlined-disabled"
                        label="File Group"
                        value={file_group_search}
                        style={{ width: 400 }}
                        onChange={this.updateFileGroupSearch}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-disabled"
                        label="File Type"
                        value={file_type_search}
                        onChange={this.updateFileTypeSearch}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-disabled"
                        label="Metadata: KEY:VALUE_REGEX"
                        value={metadata_search}
                        style={{ width: 400 }}
                        onChange={this.updateMetadataSearch}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-disabled"
                        label="File Name"
                        value={file_name_search}
                        onChange={this.updateFileNameSearch}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-disabled"
                        label="File Name (Regex)"
                        value={file_name_regex_search}
                        onChange={this.updateFileNameRegexSearch}
                        margin="normal"
                        variant="outlined"
                    />
                    <Button onClick={this.search}>Search</Button>
                </Box>
                <Paper className="root">
                    <Table className="table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Files</TableCell>
                                <TableCell align="left">File size</TableCell>
                                <TableCell align="left">Sample Id</TableCell>
                                <TableCell align="left">Request Id</TableCell>
                                <TableCell align="left">File group name</TableCell>
                                <TableCell align="left">Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files_list.results.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell component="th" scope="row">
                                        {row.file_name}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.size}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.sample_id}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.request_id}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.file_group.name}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Button
                                            variant="contained"
                                            onClick={() => this.fileDetails(row.id)}
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>
                                    <Button
                                        align="left"
                                        variant="contained"
                                        disabled={files_list.previous == null}
                                        onClick={this.previousPage}
                                    >
                                        Previous
                                    </Button>
                                </TableCell>
                                <TableCell align="center">Page: {this.state.currentPage}</TableCell>
                                <TableCell></TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="contained"
                                        disabled={files_list.next == null}
                                        onClick={this.nextPage}
                                    >
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

const ConnectedFilesPage = connect(mapStateToProps, mapDispatchToProps)(FilesPage);
export default ConnectedFilesPage;
