import {ApolloServer, gql} from 'apollo-server-micro';
import axios from 'axios';

const typeDefs = gql`
    type User {
        id: ID
        login: String
        avatar_url: String
    }
    type Query {
        getUsers: [User]
        getUser(name: String!): User!
    }
`

const resolvers = {
    Query: {
        getUsers: async () => {
            try {
                const users = await axios.get("https://api.github.com/users");
                return users.data.map(({ id, login, avatar_url }) => ({
                    id,
                    login,
                    avatar_url
                }));
            } catch (error) {
                throw error;
            }
        },
        getUser: async (_, args) => {
            try {
                const user = await axios.get(
                    `https://api.github.com/users/${args.name}`
                );
                return {
                    id: user.data.id,
                    login: user.data.login,
                    avatar_url: user.data.avatar_url
                };
            } catch (error) {
                throw error;
            }
        }
    }
}

const apolloServer = new ApolloServer({typeDefs, resolvers});

export const config = {
    api: {
        bodyParser: false
    }
}

export default apolloServer.createHandler({path: '/api/graphql'})
