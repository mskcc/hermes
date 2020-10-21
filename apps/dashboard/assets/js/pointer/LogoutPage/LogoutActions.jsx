// Send logout action
import { LOGOUT, LOGOUT_FULFILLED, LOGOUT_ERROR } from './LogoutReducer';

import { history } from '@/_helpers';
import { authenticationService } from '@/_services';

export function logout() {
    return function (dispatch) {
        dispatch(LOGOUT());
        try {
            authenticationService.logout();
            history.push('/login');
        } catch (error) {
            dispatch(
                LOGOUT_ERROR({
                    data: error,
                })
            );
            return;
        }
        dispatch(LOGOUT_FULFILLED());
    };
}
