export const SERVER_DOWN =
    'Oops! It looks like our servers are down. We are working on bringing them back up as soon as possible.';

export const NO_CHANGES = 'Hmmm, it looks like there are no changes ready to publish';

export function resourceNotFound(resourceType, queryType, queryValue) {
    const response =
        'Oh no! We could not find any ' +
        resourceType +
        ' associated with the ' +
        queryType +
        ': ' +
        queryValue;

    return response;
}
