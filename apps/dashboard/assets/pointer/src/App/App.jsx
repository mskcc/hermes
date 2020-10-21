import React from 'react';

import '@/App/App.css';
import * as appActions from './AppActions';

import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { render } from 'react-dom';
import { Router, Route, Link, Redirect, Switch } from 'react-router-dom';
import { Provider, connect } from 'react-redux';

import { PrivateRoute } from '@/_components';
import { StartRun } from '@/Run/StartRun';
import { Unauthorized } from '@/Unauthorized';
import ConnectedFilePage from '@/Files/File';
import FilesPage from '@/Files/FilesPage';
import ConnectedRunsPage from '@/Run/RunsPage.jsx';
import ConnectedLoginPage from '@/LoginPage/LoginPage';
import ConnectedLogoutPage from '@/LogoutPage/LogoutPage';
import ConnectedPipelinePage from '@/PipelinePage/PipelinePage';
import SummaryPage from '@/Summary/SummaryPage';
import MetadataPage from '@/Metadata/MetadataPage';
import Drawer from '@/_components/Drawer';
import '@/App/App.css';
import mskLogo from '@/public/MSKCC-logo.jpg';
import Grid from '@material-ui/core/Grid';

import store from '@/App/store.js';
import { history } from '@/_helpers';
import { authenticationService } from '@/_services';

import { bindActionCreators } from 'redux';

const mapStateToProps = function (state) {
    return {
        currentUser: state.loginReducer.current_user,
    };
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators(appActions, dispatch);
};

const useStyles = (theme) => ({
    root: {
        display: 'flex',
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
});

class AppContainer extends React.Component {
    constructor(props) {
        super(props);

        const pages = [
            // { link: '/summary', icon: 'insert_chart', key: 'summary', text: 'Summary' },
            //{ link: '/runs', icon: 'clear_all', key: 'runs', text: 'Runs' },
            //{ link: '/files', icon: 'source', key: 'files', text: 'Files' },
            //{ link: '/pipelines', icon: 'tune', key: 'Pipelines', text: 'Pipelines' },
            { link: '/metadata', icon: 'local_offer', key: 'metadata', text: 'Metadata' },
            { link: '/logout', icon: 'logout', key: 'logout', text: 'Logout' },
        ];
        this.state = {
            pages: pages,
        };
    }

    componentDidMount() {
        const currentUser = localStorage.getItem('currentUser', null);
        if (!currentUser) {
            history.push('/login');
        }
        authenticationService.currentUser.subscribe((userObj) => {
            if (!(userObj && userObj.user)) {
                history.push('/login');
            }
        });
    }

    logout() {
        authenticationService.logout();
        history.push('/login');
    }

    render() {
        const { pages } = this.state;
        const { classes, currentUser } = this.props;
        let userId = '';
        if (currentUser && currentUser.user) {
            if (currentUser.user.email !== '') {
                userId = currentUser.user.email;
            } else {
                userId = currentUser.user.user;
            }
        }

        return (
            <Router history={history}>
                <div className={classes.root}>
                    <CssBaseline />
                    <Route
                        path={[
                            '/files',
                            '/file/:id',
                            '/run/:id',
                            '/pipelines',
                            '/runs',
                            '/summary',
                            '/metadata',
                        ]}
                        render={() => <Drawer user={userId} pages={pages}></Drawer>}
                    />
                    <div className={`jumbotron ${classes.content}`}>
                        <Switch>
                            <Route path="/files" component={FilesPage} />
                            <Route path="/file/:id" component={ConnectedFilePage} />
                            <Route path="/run/:id" component={StartRun} />
                            <Route path="/login" component={ConnectedLoginPage} />
                            <Route path="/logout" component={ConnectedLogoutPage} />
                            <Route path="/pipelines" component={ConnectedPipelinePage} />
                            <Route path="/runs" component={ConnectedRunsPage} />
                            <Route path="/summary" component={SummaryPage} />
                            <Route path="/metadata" component={MetadataPage} />
                            <Route path="/" component={ConnectedLoginPage} />
                            <Route component={Unauthorized} />
                        </Switch>
                    </div>
                </div>
            </Router>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(AppContainer));
