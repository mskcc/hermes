import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    verticalRoot: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        width: '100%',
        //width: '20%',
        //height: 224,
    },
    verticalTabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
        overflow: 'unset',
    },
    verticalTabPanel: {
        width: '100%',
    },
}));

export default function VerticalTabs(props) {
    const classes = useStyles();
    const { handleChange, tabs, stateInfo, currentTab } = props;
    const [value, setValue] = useState(0);

    const internalHandleChange = (event, newValue) => {
        setValue(newValue);
        handleChange(event, newValue);
    };

    return (
        <div className={classes.verticalRoot}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={currentTab}
                onChange={internalHandleChange}
                className={classes.verticalTabs}
            >
                {tabs.map((tab, index) => (
                    <Tab label={tab.label} key={index} {...a11yProps(index)} />
                ))}
            </Tabs>
            {tabs.map((tab, index) => (
                <TabPanel
                    value={value}
                    key={index}
                    index={index}
                    className={classes.verticalTabPanel}
                >
                    {tab.page(stateInfo)}
                </TabPanel>
            ))}
        </div>
    );
}
