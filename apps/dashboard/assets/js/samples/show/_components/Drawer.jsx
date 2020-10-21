import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import { ListItemIcon } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import mskLogo from '@/public/MSKCC-logo.jpg';
import Avatar from '@/_components/Avatar';
import { Router, Route, Link, Redirect, Switch, useLocation } from 'react-router-dom';

const drawerWidth = '15vw';
const logoWidth = '10vw';
const titleWidth = '10vw';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        //flex-basis: auto,
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: '#2986E3',
    },
    drawerRoot: {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    userPanel: {
        backgroundColor: 'royalblue',
        flex: '0 0 12vh',
    },
    active: {
        backgroundColor: '#2875B4 !important',
        color: 'white !important',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',
    },
    iconActive: {
        minWidth: '40px',
        color: 'white',
    },
    linkPanel: {
        //backgroundColor: 'orange',
        flex: '0 0 60vh',
        textDecoration: 'none',
    },
    drawerLink: {
        textDecoration: 'inherit',
        color: 'white',
        //paddingLeft: '1.5vw',
        width: '100%',
    },
    logoImage: {
        objectFit: 'contain',
        maxWidth: logoWidth,
        //height: 'auto',
        //minWidth: 0,
        //minHeight: 0,
    },
    titleText: {
        //maxWidth: titleWidth,
        fontSize: `calc(${titleWidth}/5)`,
        //textAlign: 'center',
        //height: 'auto',
        //minHeight: 0,
        //minWidth: 0,
    },
    listIcon: {
        minWidth: '40px',
        color: 'black',
    },
    listText: {},
    ListItem: {
        display: 'inline-flex',
        flexWrap: 'nowrap',
        paddingLeft: '3vw',
    },
    headerPanel: {
        //backgroundColor: 'grey',
        flexWrap: 'nowrap',
        //flex: '0 0 20vh',
        flexBasis: '25vh',
        display: 'inline-flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        color: 'white',
        //flexShrink: 1,
        backgroundColor: '#2986E3',
        //minHeight: '20vh',
        //display: 'inline-flex',
        flexDirection: 'column',
        //alignItems: 'center',
        //justifyContent: 'center',
        //fontSize: 'calc(10px + 2vmin)',
        //color: 'white',
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
}));

export default function PermanentDrawerLeft(props) {
    const classes = useStyles();
    const { user, pages } = props;
    const location = useLocation();
    //className="header"

    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
                paper: classes.drawerPaper,
            }}
            anchor="left"
        >
            <div className={classes.drawerRoot}>
                <div className={classes.headerPanel}>
                    <img src={mskLogo} className={classes.logoImage}></img>
                    <Typography
                        variant="h1"
                        component="h2"
                        gutterBottom
                        className={classes.titleText}
                    >
                        Voyager
                    </Typography>
                </div>
                <Box className={classes.userPanel} boxShadow={4}>
                    <Avatar user={user}></Avatar>
                </Box>
                <div className={classes.linkPanel}>
                    <List>
                        {pages.map((page) => (
                            <Link to={page.link} className={classes.drawerLink} key={page.key}>
                                <div>
                                    <ListItem
                                        button
                                        className={classes.ListItem}
                                        selected={location.pathname === page.link}
                                        classes={{ selected: classes.active }}
                                    >
                                        <ListItemIcon
                                            className={
                                                location.pathname === page.link
                                                    ? classes.iconActive
                                                    : classes.listIcon
                                            }
                                        >
                                            <i className="material-icons">{page.icon}</i>
                                        </ListItemIcon>
                                        <ListItemText
                                            className={classes.listText}
                                            primary={page.text}
                                        />
                                    </ListItem>
                                </div>
                            </Link>
                        ))}
                    </List>
                </div>
            </div>
            <Divider />
        </Drawer>
    );
}
