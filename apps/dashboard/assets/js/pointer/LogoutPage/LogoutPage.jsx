//logout page, render not needed

import React from 'react';
import { bindActionCreators } from 'redux';
import * as logoutActions from '@/LogoutPage/LogoutActions';
import { connect } from 'react-redux';

const mapStateToProps = function (state) {
    return {};
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators(logoutActions, dispatch);
};

class LogoutPage extends React.Component {
    constructor(props) {
        super(props);
        this.props.logout();
    }

    render() {
        return 'Logging out...';
    }
}

const ConnectedLogoutPage = connect(mapStateToProps, mapDispatchToProps)(LogoutPage);
export default ConnectedLogoutPage;
