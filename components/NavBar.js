import React, {useEffect, useState} from 'react';
import {
    AppBar,
    Button,
    ButtonBase,
    IconButton,
    InputBase,
    makeStyles,
    Toolbar,
    Typography,
    fade,
    Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import Link from "next/link";
import {Search} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
            flexGrow: '',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '30ch',
        },
    },
}))

export default function NavBar(){
    const classes = useStyles();
    const image_path = 'https://image.tmdb.org/t/p/w92/'

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <ButtonBase as={Link} href={"/"} style={{padding: '10px'}}>
                        <Typography variant="h6">
                            Demo
                        </Typography>
                    </ButtonBase>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <Search />
                        </div>
                        <div style={{width: 'max-content', position: 'relative'}} onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                clearSearch();
                            }
                        }}>
                            <InputBase
                                placeholder="Search…"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{'aria-label': 'search'}}
                            />
                        </div>
                    </div>
                    <div className={classes.title}></div>
                    <Button color="inherit" as={Link} href={'/favorites'}>Favorites</Button>
                </Toolbar>
            </AppBar>
        </div>
    );
}
