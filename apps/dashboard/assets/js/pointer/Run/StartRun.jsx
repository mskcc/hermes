import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import { InputLabel } from '@material-ui/core';
import { FilePicker } from '@/Run';

import { runService, authenticationService } from '@/_services';


class StartRun extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            run: {
                app: null,
                inputs: [],
                outputs: []
            },
            input_values: {

            },
            file_picker_open: false,
            file_picker_id: null,
            list: false
        };
        this.createInput = this.createInput.bind(this);
        this.prepopulate_values = this.prepopulate_values.bind(this);
        this.prepopulate_value = this.prepopulate_value.bind(this);
        this.getRun = this.getRun.bind(this);
        this.openFilePickerSingle = this.openFilePickerSingle.bind(this);
        this.openFilePickerList = this.openFilePickerList.bind(this);
        this.closeFilePicker = this.closeFilePicker.bind(this);
        this.updateInputValues = this.updateInputValues.bind(this);
        this.startRun = this.startRun.bind(this);
    }

    componentDidMount() {
        this.getRun(this.props.match.params.id)
    }

    prepopulate_values(inputs) {
        if (inputs != 'undefined') {
            inputs.map(input => this.prepopulate_value(input))
        }
    }

    prepopulate_value(input) {
        if (input.schema.type.constructor == Object && input.schema.type.type == 'array') {
            this.setState({input_values: {[input.id]: [""]}});
        }
        else {
            this.setState({input_values: {[input.id]: null}});
        }
    }

    getRun(run_id) {
        runService.getRun(run_id).then(run => this.setState({ run })).then(run => this.prepopulate_values(this.state.run.inputs));


        // this.props.getRun(run_id);
    }

    openFilePickerSingle(id) {
        this.setState({file_picker_id: id, file_picker_open: true, list: false});
    }

    openFilePickerList(id) {
        this.setState({file_picker_id: id, file_picker_open: true, list: true});
    }

    saveFilePicker(value) {
        var data = this.state.input_values
        data[this.state.file_picker_id] = Object.keys(value)
        this.setState({input_values: data, file_picker_open: false});
    }

    updateInputValues(id, value) {
        var data = this.state.input_values;
        data[id] = value;
        this.setState({input_values: data})
    }

    closeFilePicker() {
        this.setState({file_picker_open: false});
    }

    startRun() {
        runService.updatePorts(this.props.match.params.id, this.state.input_values, 1).then(res => this.props.history.push("/runs"))
    }

    createInput(input) {
        if (input.schema.type == 'Any' || input.schema.type == 'int' || input.schema.type == 'long' || input.schema.type =='float' || input.schema.type =='string') {
            return (
                <div>
                    <InputLabel>{input.name}</InputLabel><InputLabel>{this.state.input_values[input.id]}</InputLabel>
                    <TextField
                        id="outlined-name"
                        fullWidth='true'
                        label={input.name}
                        value={this.state.input_values[input.id]}
                        onChange={e => this.updateInputValues(input.id, e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                </div>
            );
        }
        else if (input.schema.type == 'File' ) {
            return (
                <div>
                    <InputLabel>{input.name}</InputLabel><InputLabel>{this.state.input_values[input.id]}</InputLabel>
                    <Button key={input.id} onClick={e => this.openFilePickerSingle(input.id)}>Browse</Button>
                </div>
            );
        }
        else if (input.schema.type.constructor == Object && input.schema.type.type == 'array') {
            if (input.schema.type == 'Any' || input.schema.type == 'int' || input.schema.type == 'long' || input.schema.type =='float' || input.schema.type =='string') {
                return (
                    <div>
                        <InputLabel>{input.name}</InputLabel><InputLabel title="Value">{this.state.input_values[input.id]}</InputLabel>
                        <TextField
                            id="outlined-name"
                            fullWidth='true'
                            label={input.name}
                            value={this.state.input_values[input.id]}
                            onChange={e => this.setState({input_values: {[input.id]: e.target.value}})}
                            margin="normal"
                            variant="outlined"
                        />
                    </div>
                );
            }
            else {
                return (
                    <div>
                        <InputLabel>{input.name}</InputLabel><InputLabel>{this.state.input_values[input.id]}</InputLabel>
                        <Button key={input.id} onClick={e => this.openFilePickerList(input.id)}>Browse</Button>
                    </div>);
            }
        }
    }

    render() {
        const { run } = this.state; 
        return (
            <div>
                {run.name}
                <br/>
                {run.inputs.map(row => this.createInput(row))}
                <Button onClick={this.startRun}>Start</Button>
                <FilePicker parent={this} open={this.state.file_picker_open} list={this.state.list}></FilePicker>
            </div>
        )

    }
}

export { StartRun };