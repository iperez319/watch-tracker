import {ApolloServer, gql} from 'apollo-server-micro';
import axios from 'axios';
import {RESTDataSource} from "apollo-datasource-rest";

class TmdbAPI extends RESTDataSource {
    constructor(){
        super();
        this.baseURL = 'https://api.themoviedb.org/3/';
    }
    willSendRequest(request) {
        request.params.set('api_key', process.env.API_KEY);
    }
    async getTrendingShows(){
        console.log('TEST')
        const result = await this.get('trending/tv/day');
        return result.results;
    }
    async getPopularShows(){
        const result = await this.get('tv/popular');
        return result.results;
    }
    async getShowDetail(id) {
        const result = await this.get(`tv/${id}`, {'append_to_response': 'credits,watch/providers,similar'});
        return result
    }
    async getSeason(id, season_number){
        const result = await this.get(`tv/${id}/season/${season_number}`);
        result.showId = id
        return result
    }
    async getEpisode(id, season_number, episode_number){
        const result = await this.get(`tv/${id}/season/${season_number}/episode/${episode_number}`);
        result.showId = id
        return result;
    }
}

const typeDefs = gql`
    
    type Creator {
        id: ID
        name: String
        profile_path: String
    }
    
    type Actor {
        id: ID
        known_for_deparment: String
        name: String
        character: String
        profile_path: String
    }
    
    type Provider {
        provider_name: String
        provider_id: ID
        logo_path: String
    }
    
    type ProviderList {
        buy: [Provider]
        flatrate: [Provider]
    }
    
    type Show {
        id: ID
        name: String
        poster_path: String
        backdrop_path: String
        genres: [String]
        status: String
        vote_average: Float
        number_of_episodes: Int
        number_of_seasons: Int
        tagline: String
        popularity: Float
        seasons: [Season]
        created_by: [Creator]
        cast: [Actor]
        providers: ProviderList
        overview: String,
        similar: [Show]
        first_air_date: String
    }
    
    type Season {
        id: ID
        air_date: String
        episode_count: Int
        name: String
        overview: String
        poster_path: String
        season_number: Int
        episodes: [Episode]
    }
    
    type Episode {
        id: ID
        air_date: String
        episode_number: Int
        name: String
        overview: String
        season_number: Int
        still_path: String
        vote_average: Float
    }

    type Query {
        trendingShows: [Show]
        popularShows: [Show]
        show(id: ID): Show,
        season(showId: ID, season_number: Int): Season
        episode(showId: ID, season_number: Int, episode_number: Int): Episode
    }
`

const resolvers = {
    Query: {
        trendingShows: async (_, __, {dataSources}) => {
            return dataSources.tmdbAPI.getTrendingShows()
        },
        popularShows: async (_, __, {dataSources}) => {
            return dataSources.tmdbAPI.getPopularShows()
        },
        show: async (_, {id}, {dataSources}) => {
            return dataSources.tmdbAPI.getShowDetail(id)
        },
        season: async(_, {showId, season_number}, {dataSources}) => {
            return dataSources.tmdbAPI.getSeason(showId, season_number)
        },
        episode: async(_, {showId, season_number, episode_number}, {dataSources}) => {
            return dataSources.tmdbAPI.getEpisode(showId, season_number, episode_number)
        },
    },
    Show: {
        genres: async (parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id)).genres.map(item => item.name);
        },
        number_of_episodes: async (parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id)).number_of_episodes;
        },
        number_of_seasons: async (parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id)).number_of_seasons;
        },
        seasons: async(parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id)).seasons.map(item => ({...item, showId: parent.id}));
        },
        cast: async(parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id)).credits.cast.filter(item => item.known_for_department === 'Acting') ?? [];
        },
        providers: async(parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id))['watch/providers'].results.US;
        },
        similar: async(parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getShowDetail(parent.id)).similar.results
        }
    },
    Season: {
        episodes: async (parent, _, {dataSources}) => {
            return (await dataSources.tmdbAPI.getSeason(parent.showId, parent.season_number)).episodes
        }
    }
}

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        tmdbAPI: new TmdbAPI(),
    }),
    tracing: process.env.NODE_ENV !== 'production'
});

export const config = {
    api: {
        bodyParser: false
    }
}

export default apolloServer.createHandler({path: '/api/graphql'})
