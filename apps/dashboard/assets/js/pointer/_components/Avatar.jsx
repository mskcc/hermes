import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';

const avatarWidth = '3.5vw';
const userWidth = '12vw';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        //'& > *': {
        //    margin: theme.spacing(1),
        //},
    },
    orange: {
        color: theme.palette.getContrastText(deepOrange[500]),
        backgroundColor: deepOrange[500],
    },
    purple: {
        color: theme.palette.getContrastText(deepPurple[500]),
        backgroundColor: deepPurple[500],
    },
    avatarElem: {
        objectFit: 'contain',
        width: avatarWidth,
        height: avatarWidth,
        color: theme.palette.getContrastText(deepOrange[500]),
        backgroundColor: deepOrange[500],
        fontSize: '2vw',
    },
    userElem: {
        maxWidth: userWidth,
        color: 'white',
        fontSize: `calc(${userWidth}/10)`,
    },
}));

export default function LetterAvatars(props) {
    const classes = useStyles();
    const { user } = props;
    const firstLetter = user.substring(0, 1);

    return (
        <div className={classes.root}>
            <Avatar className={classes.avatarElem}>{firstLetter}</Avatar>
            <Typography className={classes.userElem}>{user}</Typography>
        </div>
    );
}
