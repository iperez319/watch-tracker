import React from 'react';
import {ButtonBase, Container, IconButton, makeStyles, Typography} from "@material-ui/core";
import Link from 'next/link';
import {Favorite} from "@material-ui/icons";
import Poster from "./Poster";

const useStyles = makeStyles(theme => ({
    posterList: {
        display: 'flex',
        overflowY: 'auto',
        marginTop: '20px',
    },
    container: {
        padding: '10px',
    },
    title: {
        marginBottom: '-10px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '27px'
        }
    }
}))

export default function PosterList({title, shows}) {
    const classes = useStyles();
    return shows.length > 0 ? (
        <div style={{marginTop: '20px'}}>
            <Typography variant={'h4'} className={classes.title}>{title}</Typography>
            <div className={classes.posterList}>
                {
                    shows.map((item) => item.poster_path ? <Poster show={item} key={`poster-${item.id}`}/> : null)
                }
            </div>
        </div>
    ) : null
}
