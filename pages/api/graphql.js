import {ApolloServer, gql} from 'apollo-server-micro';
import axios from 'axios';
import {RESTDataSource} from "apollo-datasource-rest";

class TmdbAPI extends RESTDataSource {
    constructor(){
        super();
        this.baseURL = 'https://api.themoviedb.org/3/';
    }
    willSendRequest(request) {
        request.params.set('api_key', 'cdbe4fd0e38a206f5dd681b2d580f810');
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
        const result = await this.get(`tv/${id}`);
        return result
    }
    async getSeason(id, season_number){
        const result = await this.get(`tv/${id}/season/${season_number}`);
        return result
    }
    async getEpisode(id, season_number, episode_number){
        const result = await this.get(`tv/${id}/season/${season_number}/episode/${episode_number}`);
        return result;
    }
}

const typeDefs = gql`
    
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
        season: async(_, {id, season_number}, {dataSources}) => {
            return dataSources.tmdbAPI.getSeason(id, season_number)
        },
        episode: async(_, {id, season_number, episode_number}, {dataSources}) => {
            return dataSources.tmdbAPI.getEpisode(id, season_number, episode_number)
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
    })
});

export const config = {
    api: {
        bodyParser: false
    }
}

export default apolloServer.createHandler({path: '/api/graphql'})
