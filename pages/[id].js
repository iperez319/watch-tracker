import React from 'react';
import {useRouter} from 'next/router';
import axios from "axios";
import {Chip, Container, makeStyles, Paper, Typography, Accordion, AccordionSummary, AccordionDetails} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab"
import PosterList from "../components/PosterList";
import ProviderList from "../components/ProviderList";
import {ExpandMore} from "@material-ui/icons";
import {gql, useQuery} from "@apollo/client";
import {initializeApollo} from "../lib/apolloClient";

const GET_SHOW_DETAILS = gql`
    query getShowDetails($id: ID) {
        show(id: $id){
            id
            name
            genres
            poster_path
            first_air_date
            tagline
            seasons {
                name
                overview
                poster_path
                air_date
            }
            overview
            created_by {
                name
            }
            providers {
                buy {
                    provider_name
                    provider_id
                    logo_path
                }
                flatrate {
                    provider_name
                    provider_id
                    logo_path
                }
            }
            cast {
                id
                name
                character
                profile_path
            }
            similar {
                id
                vote_average
                poster_path
            }
        }
    }
`
const GET_TRENDING_SHOWS = gql`
    query getTrendingShows {
        trendingShows {
            id
        }
    }
`
const GET_POPULAR_SHOWS = gql`
    query getPopularShows {
        popularShows {
            id
        }
    }
`


export async function getServerSideProps(context){

    const {id} = context.params;

    const apolloClient = initializeApollo();

    await apolloClient.query({
        query: GET_SHOW_DETAILS,
        variables: {id}
    })

    return {
        props: {
            initialApolloState: apolloClient.cache.extract(),
        }
    }
}

// export async function getStaticProps(context){
//
//     const {id} = context.params;
//
//     const apolloClient = initializeApollo();
//
//     await apolloClient.query({
//         query: GET_SHOW_DETAILS,
//         variables: {id}
//     })
//
//     return {
//         props: {
//             initialApolloState: apolloClient.cache.extract(),
//         },
//         revalidate: 450,
//     }
// }

// export async function getStaticPaths(){
//
//     const apolloClient = initializeApollo();
//     const trendingShowsPromise = apolloClient.query({
//         query: GET_TRENDING_SHOWS
//     })
//     const popularShowsPromise = await apolloClient.query({
//         query: GET_POPULAR_SHOWS,
//     })
//     const [{data: {trendingShows}}, {data: {popularShows}}] = await Promise.all([trendingShowsPromise, popularShowsPromise])
//     console.log(trendingShows)
//     return {
//         paths: [...trendingShows, ...popularShows].map(item => ({params: {id: item.id}})),
//         fallback: true,
//     }
// }

const useStyles = makeStyles(theme => ({
    posterImage: {
        borderRadius: '5px',
        [theme.breakpoints.down('sm')]: {
            height: '250px',
            marginBottom: '20px',
        },
    },
    chips: {
        marginRight: '10px'
    },
    infoContainer: {
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        }
    },
    sectionTitle: {
        [theme.breakpoints.down('sm')]: {
            fontSize: '27px',
        }
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}))

export default function ShowDetail(props){
    const classes = useStyles();
    const base_poster_path = 'https://image.tmdb.org/t/p/w342';
    const base_profile_path = 'https://image.tmdb.org/t/p/w138_and_h175_face'

    const router = useRouter();
    const {id} = router.query;

    const {data: showData, loading} = useQuery(GET_SHOW_DETAILS, {variables: {id}})
    const CastList = () => {
        return showData?.show?.cast.length > 0 ? (<div style={{marginTop: '20px'}}>
            <Typography variant={'h4'} className={classes.sectionTitle}>Cast</Typography>
            <div style={{display: 'flex', overflowY: 'auto', marginTop: '10px'}}>
                {
                    showData?.show?.cast.map(item => (
                        <Paper style={{width: 'min-content', marginRight: '30px'}} key={`cast-${item.id}`}>
                            <img src={base_profile_path + item.profile_path} style={{borderTopLeftRadius: '4px', borderTopRightRadius: '4px'}}/>
                            <div style={{padding: '10px', maxHeight: '150px', overflow: 'auto'}}>
                                <Typography variant={'body1'}
                                            style={{fontWeight: 'bold'}}>{item.name}</Typography>
                                <Typography variant={'body1'}>{item.character}</Typography>
                            </div>
                        </Paper>
                    ))
                }
            </div>
        </div>) : null;
    }
    const Tags = () => {
        return (
            <div style={{overflow: 'auto', marginTop: '5px'}}>
                {
                    showData?.show?.genres.map(item => <Chip label={item} className={classes.chips} color={'primary'} key={`tag-${item}`}/>)
                }
            </div>
        )
    }
    const Creator = () => {
        return (
            showData?.show?.created_by.length > 0 ?
                <>
                    <Typography variant={'body1'} style={{fontWeight: 'bold', marginTop: '20px'}}>
                        {showData?.show?.created_by[0]?.name}
                    </Typography>
                    <Typography variant={'body1'}>Creator</Typography>
                </> : null
        )
    }
    const SeasonDetails = () => {
        return ( showData?.show?.seasons ?
                <div style={{marginTop: '20px'}}>
                    <Typography variant={'h4'} className={classes.sectionTitle}>Seasons</Typography>
                    <div style={{marginTop: '10px'}}>
                        {
                            showData?.show?.seasons.map(season =>
                                <Accordion disabled={season.overview === ""}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography className={classes.heading}>{season.name} {season.air_date ? '(' + (new Date(season.air_date)).toLocaleDateString() + ')' : null}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <img src={base_poster_path + season.poster_path} style={{height: '150px', borderRadius: '5px'}}/>
                                            <Typography variant={'body1'} style={{marginLeft: '10px'}}>
                                                {season.overview}
                                            </Typography>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            )
                        }
                    </div>
                </div> : null
        )
    };

    const MainPage = () => {
        return (
            <Container style={{marginTop: '20px', paddingBottom: '40px'}}>
                <div style={{display: 'flex', alignItems: 'center'}} className={classes.infoContainer}>
                    <img src={base_poster_path + showData?.show?.poster_path} className={classes.posterImage}/>
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '20px'}}>
                        <Typography variant={'h3'} as={'p'}>{showData?.show?.name}{showData?.show?.first_air_date ? ' (' + (new Date(showData?.show?.first_air_date)).getFullYear().toString() + ')' : ''}</Typography>
                        <Tags/>
                        <Typography variant={'subtitle1'}
                                    style={{fontStyle: 'italic', marginTop: '10px'}}>{showData?.show?.tagline}</Typography>
                        <Typography variant={'h6'} style={{marginTop: '10px'}}>Overview</Typography>
                        <Typography variant={'body1'}>{showData?.show?.overview}</Typography>

                        <ProviderList providers={showData?.show?.providers?.flatrate} title={"Stream"}/>
                        <ProviderList providers={showData?.show?.providers?.buy} title={'Buy'}/>
                        <Creator/>
                    </div>
                </div>
                <SeasonDetails/>
                <CastList/>
                <PosterList shows={showData?.show?.similar ?? []} title={'Similar Shows'}/>
            </Container>
        )
    }
    const SkeletonPage = () => {
        return (
            <Container style={{marginTop: '20px', paddingBottom: '40px'}}>
                <div style={{display: 'flex', alignItems: 'center'}} className={classes.infoContainer}>
                    <Skeleton variant={'rect'} width={345} height={513}/>
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '20px'}}>
                        <Skeleton variant={'text'} width={500} height={60}/>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {
                                [1, 2, 3].map(item => <Skeleton variant={'rect'} width={70} height={32} style={{marginRight: '10px', borderRadius: '10px'}}/>)
                            }
                        </div>
                        <Skeleton variant={'text'} width={400} height={28} style={{marginTop: '10px'}}/>
                        <Skeleton variant={'text'} width={100} height={32} style={{marginTop: '10px'}}/>
                        <Skeleton variant={'text'} width={500} height={125} style={{marginTop: '-20px'}}/>
                        <Skeleton variant={'text'} width={100} height={32} style={{marginTop: '10px'}}/>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {
                                [1, 2, 3].map(item => <Skeleton variant={'rect'} width={60} height={60} style={{marginRight: '10px', borderRadius: '10px'}}/>)
                            }
                        </div>
                    </div>
                </div>
            </Container>
        )
    }

    return router.isFallback || loading ? <SkeletonPage/> : <MainPage/>
}
