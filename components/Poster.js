import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {ButtonBase, IconButton, makeStyles} from "@material-ui/core";
import {Favorite} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
    buttonBaseContainer: {
        marginRight: '15px',
        position: 'relative',
    },
    posterImage: {
        height: '225px',
        borderRadius: '5px',
        [theme.breakpoints.down('sm')]:{
            height: '175px',
        }
    },
    favoriteButton: {
        position: 'absolute',
        top: '0',
        right: '0',
    },
    ratingsContainer: {
        position: 'absolute',
        top: '15px',
        left: '5px',
        padding: '0px 10px',
        backgroundColor: 'rgba(72, 72, 72, 0.6)',
        borderRadius: '10px',
        fontWeight: 'bold',
    }
}))

export default function Poster({show}){
    const [isFavorite, setIsFavorite] = useState(false);
    const classes = useStyles();
    const image_path = 'https://image.tmdb.org/t/p/w220_and_h330_face/'
    const handleClick = (evt) => {
        evt.preventDefault();
        let storedData = localStorage.getItem('favoriteShows') ?? '[]';
        let parsedData = JSON.parse(storedData);
        if(isFavorite){
            //Remove from store
            let newItems = parsedData.filter(item => item.id != show.id);
            localStorage.setItem('favoriteShows', JSON.stringify(newItems));
        } else {
            //Add to store
            const {id, vote_average, poster_path} = show;
            parsedData.push({id, vote_average, poster_path});
            localStorage.setItem('favoriteShows', JSON.stringify(parsedData))
        }
        setIsFavorite(!isFavorite);
    }

    useEffect(() => {
        const rawItems = localStorage.getItem('favoriteShows') ?? '[]'
        const items = JSON.parse(rawItems);
        setIsFavorite(items.find(item => item.id == show.id));
    }, [])

    return (
        <ButtonBase as={Link} href={`/${show.id}`} className={classes.buttonBaseContainer}>
            <img src={image_path + show.poster_path} className={classes.posterImage} alt={show.name}/>
            <IconButton style={{color: isFavorite ? 'red' : ''}} className={classes.favoriteButton} onClick={handleClick}><Favorite/></IconButton>
            <div className={classes.ratingsContainer}>{show.vote_average ?? 0.0}</div>
        </ButtonBase>
    )
}
