import React, { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import MaterialTable from 'material-table';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { setupTable } from '@/_helpers';

const HEADER_COLOR = '#FFF';
const HEADER_BACKGROUND_COLOR = 'slategrey';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    progressSpinner: {
        width: '1.5rem !important',
        height: '1.5rem !important',
    },
    registrationText: {
        textAlign: 'center',
    },
    searchBox: {
        padding: 'inherit',
    },
    titleBox: {
        padding: 'inherit',
        textAlign: 'center',
    },
}));

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const debouncedHandler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(debouncedHandler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function ProjectStatusPage(props) {
    const classes = useStyles();
    const { projectDataList, handleEvent, pushEvent } = props;
    console.log(projectDataList);
    const [projectData, updateProjectData] = useState(projectDataList);
    const [projectTableData, updateProjectTableData] = useState([]);
    const [projectTableColumn, updateProjectTableColumn] = useState([]);
    const [isLoading, updateIsLoading] = useState(false);
    const [searchQuery, updateSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    console.log(debouncedSearchQuery);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.post['X-CSRF-Token'] = csrfToken;
    const setUp = () => {
        const { tableData, tableColumn, tableTitleToField } = setupTable(
            projectData,
            {},
            'status',
            [],
            {}
        );
        updateProjectTableData(tableData);
        updateProjectTableColumn(tableColumn);
    };
    const tableOptions = {
        headerStyle: {
            backgroundColor: HEADER_BACKGROUND_COLOR,
            color: HEADER_COLOR,
        },
        search: false,
        toolbar: false,
    };

    useEffect(() => {
        if (handleEvent && pushEvent) {
            if (projectData && projectData.length !== 0) {
                setUp();
            } else if (projectData.length == 0 && projectDataList.length != 0) {
                updateProjectData(projectDataList);
            } else {
                //pushEvent('fetch', params);
            }
        }
    }, [projectData]);

    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.paper}>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <Paper className={classes.searchBox}>
                            <TextField
                                margin="normal"
                                variant="standard"
                                fullWidth
                                label="Search"
                                name="search"
                                id="search"
                                autoFocus
                                onChange={(event) => {
                                    updateSearchQuery(event.target.value);
                                }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={8} direction="column" display="flex" justify="center">
                        <Typography variant="h3" className={classes.titleBox}>
                            Project Status
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <MaterialTable
                            data={projectTableData}
                            columns={projectTableColumn}
                            options={tableOptions}
                        ></MaterialTable>
                    </Grid>
                </Grid>
            </div>
        </Container>
    );
}
