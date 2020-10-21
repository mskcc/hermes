import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import { Button } from '@material-ui/core';

import { authenticationService } from '@/_services';
import * as fileActions from '@/Files/FileActions';

const mapStateToProps = function (state) {
    return {
        file: state.fileReducer.file,
        file_types: state.fileReducer.file_types,
    };
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators(fileActions, dispatch);
};

class FilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: {},
            path: '',
            size: '',
            file_type: null,
            metadata: {},
            metadata_error: '',
            file_types: [
                { id: 1, ext: 'fastq_local' },
                { id: 2, ext: 'bam_local' },
            ],
            file_update_error: '',
        };

        this.updatePath = this.updatePath.bind(this);
        this.updateSize = this.updateSize.bind(this);
        this.resetPath = this.resetPath.bind(this);
        this.updateFileType = this.updateFileType.bind(this);
        this.resetFileType = this.resetFileType.bind(this);
        this.updateMetadata = this.updateMetadata.bind(this);
        this.resetMetadata = this.resetMetadata.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.getFile = this.getFile.bind(this);
    }

    componentWillMount() {
        if (authenticationService.currentUserValue == null) {
            this.props.history.push({ pathname: '/', state: { from: '/file' } });
        }
        this.props.getFile(this.props.match.params.id);
        this.props.getFileTypes();
    }

    getFile(file_id) {
        this.props.getFile(file_id);
    }

    updatePath(event, value) {
        this.setState({ path: event.target.value });
    }

    updateSize(event, value) {
        this.setState({ size: event.target.value });
    }

    resetPath(event) {
        this.setState({ path: this.state.file.path });
    }

    updateFileType(event, value) {
        this.setState({ file_type: event.target.value });
    }

    resetFileType(event) {
        this.setState({ file_type: this.state.file.file_type });
    }

    updateMetadata(event) {
        try {
            this.setState({
                metadata: JSON.parse(event.target.value),
                metadata_string: event.target.value,
                metadata_error: '',
            });
        } catch (e) {
            this.setState({
                metadata: event.target.value,
                metadata_string: event.target.value,
                metadata_error: 'Invalid json' + e,
            });
        }
    }

    resetMetadata(event) {
        this.setState({ metadata_string: JSON.stringify(this.state.file.metadata, null, 2) });
    }

    updateFile() {
        if (this.state.metadata_error !== '') {
            this.setState({ file_update_error: 'Fix error' });
        } else {
            this.props.updateFile(
                this.state.file.id,
                this.state.path,
                this.state.size,
                this.state.file_type,
                this.state.metadata
            );
        }
    }

    render() {
        if (!this.props.file || !this.props.file.size) {
            return <div>Loading File</div>;
        }

        const { file, metadata_error, file_update_error, user, file_types } = this.props;
        const metadata_string = JSON.stringify(file.metadata, null, 2);

        return (
            <div>
                Last updated by: {user}
                <Box component="span" m={1}>
                    <TextField
                        disabled
                        id="outlined-disabled"
                        fullWidth={true}
                        label="File Name"
                        value={file.file_name}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-name"
                        fullWidth={true}
                        label="Size"
                        value={file.size}
                        onChange={this.updateSize}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-name"
                        fullWidth={true}
                        label="Path"
                        value={file.path}
                        onChange={this.updatePath}
                        margin="normal"
                        variant="outlined"
                    />
                    <Button onClick={this.resetPath}>Reset</Button>
                    <TextField
                        id="outlined-name"
                        fullWidth={true}
                        label="File Type"
                        value={file.file_type}
                        onChange={this.updateFileType}
                        margin="normal"
                        variant="outlined"
                    />
                    {/* <InputLabel htmlFor="File Type">Type</InputLabel>
                                        <Select
                                            native
                                            required
                                            value={file_type}
                                            onChange={this.updateFileType}
                                        >
                                            {file_types.map(row => (
                                              <option value={row.id}>{row.ext}</option>))}
                                        </Select> */}
                    <Button onClick={this.resetFileType}>Reset</Button>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Metadata"
                        fullWidth={true}
                        multiline
                        rowsMax="100"
                        value={metadata_string}
                        onChange={this.updateMetadata}
                        margin="normal"
                        helperText={metadata_error}
                        variant="outlined"
                    />
                    <Button onClick={this.resetMetadata}>Reset</Button>
                    <Button onClick={this.updateFile}>Save</Button>
                    <br />
                    {file_update_error}
                </Box>
            </div>
        );
    }
}

const ConnectedFilePage = connect(mapStateToProps, mapDispatchToProps)(FilePage);
export default ConnectedFilePage;
