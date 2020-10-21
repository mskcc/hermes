export function authHeader() {
    // return authorization header with jwt token

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.access) {
        //authenticationService.refresh();
        return {
            Authorization: `Bearer ${currentUser.access}`,
            'Content-Type': 'application/json',
        };
    } else {
        return {};
    }
}
