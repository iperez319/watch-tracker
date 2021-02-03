import Head from 'next/head'
import {Button, ButtonBase, Container, Typography} from "@material-ui/core";
import Image from 'next/image';
import axios from 'axios';
import PosterList from "../components/PosterList";
import {initializeApollo} from "../lib/apolloClient";
import {gql, useQuery} from "@apollo/client";

const GET_TRENDING_SHOWS = gql`
    query getTrendingShows {
        trendingShows {
            id
            poster_path
            vote_average
            name
        }
    }
`

const GET_POPULAR_SHOWS = gql`
    query getPopularShows {
        popularShows {
            id
            poster_path
            vote_average
            name
        }
    }
`

export async function getServerSideProps(context){
    const apolloClient = initializeApollo();

    await apolloClient.query({
        query: GET_TRENDING_SHOWS
    })

    await apolloClient.query({
        query: GET_POPULAR_SHOWS
    })

    return {
        props: {
            initialApolloState: apolloClient.cache.extract()
        }
    }
}

// export async function getStaticProps(context){
//     const apolloClient = initializeApollo();
//
//     await apolloClient.query({
//         query: GET_TRENDING_SHOWS
//     })
//
//     await apolloClient.query({
//         query: GET_POPULAR_SHOWS
//     })
//
//     return {
//         props: {
//             initialApolloState: apolloClient.cache.extract()
//         },
//         revalidate: 450,
//     }
// }

export default function Home(props) {

    const {data: {trendingShows}} = useQuery(GET_TRENDING_SHOWS);
    const {data: {popularShows}} = useQuery(GET_POPULAR_SHOWS);
    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container style={{padding: '10px'}}>
                <PosterList title={"Popular Shows"} shows={popularShows} />
                <PosterList title={'Trending Shows'} shows={trendingShows} />
            </Container>
        </div>
    )
}

