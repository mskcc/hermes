import { BehaviorSubject } from 'rxjs';

import config from 'config';

export const currentUserSubject = new BehaviorSubject(
    JSON.parse(localStorage.getItem('currentUser'))
);

export const authenticationService = {
    logout,
    refresh,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() {
        return currentUserSubject.value;
    },
};

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
}

function refresh() {
    const user = localStorage.getItem('currentUser');
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: user,
    };
    return fetch(`${config.apiUrl}/api-token-refresh/`, requestOptions).then((accessToken) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        var userInfo = JSON.parse(user);
        userInfo['access'] = accessToken['access'];
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        currentUserSubject.next(userInfo);

        return userInfo;
    });
}
