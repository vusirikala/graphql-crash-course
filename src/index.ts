import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
    type Game {
        id: ID!
        title: String!
        platform: [String!]!
        reviews: [Review!]
    }
    type Review {
        id: ID!
        rating: Int!
        content: String!
        game: Game!
        author: Author!
    }
    type Author {
        id: ID!,
        name: String!
        verified: Boolean!
        reviews: [Review!]
    }
    type Query {
        reviews: [Review]
        review(id: ID!): Review     # Client can also make query for a single review
        games: [Game]
        game(id: ID!): Game
        authors: [Author]
        author(id: ID!): Author
    }
    type Mutation {
        addGame(game: AddGameInput): Game
        deleteGame(id: ID!): [Game]
        updateGame(id: ID!, edits: EditGameInput): Game
    }
    input AddGameInput {
        title: String!
        platform: [String!]!
    }
    input EditGameInput {
        title: String
        platform: [String!]
    }
`;
//! means required
// Graphql types: int, float, string, bool, ID
// Every GraphQl schema needs to specify the Query type. Its mandatory. 
// The Query type tells the list of entrypoints a graphql query could have.


let games = [
    { id: '1', title: 'Call of Duty: Modern Warfare', platform: ['PS4'] },
    { id: '2', title: 'The Legend of Zelda: Breath of the Wild', platform: ['Nintendo Switch'] },
    { id: '3', title: 'Super Mario Odyssey', platform: ['Nintendo Switch, PS4, Xbox'] },
    { id: '4', title: 'Red Dead Redemption 2', platform: ['PS4, Xbox, PC'] },
];

let authors = [
    { id: '1', name: 'John Doe', verified: true },
    { id: '2', name: 'Sara Smith', verified: false },
    { id: '3', name: 'Jane Doe', verified: true },
    { id: '4', name: 'Tom Brown', verified: false },
];

let reviews = [
    { id: '1', rating: 9, content: 'Great game!', gameId: '2', authorId: '1' },
    { id: '2', rating: 8, content: 'Awesome game!', gameId: '1', authorId: '2' },
    { id: '3', rating: 7, content: 'Good game!', gameId: '3', authorId: '3' },
    { id: '4', rating: 6, content: 'Not bad!', gameId: '4', authorId: '2' },
];


const resolvers = {
    Query: {
        games() {
            return games
        },
        game(_: any, args: any) {
            return games.find(game => game.id === args.id)
        },
        reviews() {
            return reviews
        },
        review(_: any, args: any) {
            return reviews.find(review => review.id === args.id)
        },
        authors() {
            return authors
        },
        author(_: any, args: any) {
            return authors.find(author => author.id === args.id)
        }
    },
    Game: {
        reviews(parent: any) {
            return reviews.filter(review => review.gameId === parent.id)
        }
    },
    Author: {
        reviews(parent: any) {
            return reviews.filter(review => review.authorId === parent.id)
        }
    },
    Review: {
        game(parent: any) {
            return games.find(game => game.id === parent.gameId)
        },
        author(parent: any) {
            return authors.find(author => author.id === parent.authorId)
        }
    },
    Mutation: {
        deleteGame(_: any, args: any) {
            games = games.filter(game => game.id !== args.id)
            return games
        },
        addGame(_: any, args: any) {
            const newGame = { id: Math.floor(Math.random()*10000).toString(), ...args.game }
            games.push(newGame)
            return newGame
        },
        updateGame(_: any, args: any) {
            games = games.map(game => {
                if(game.id === args.id) {
                    return { ...game, ...args.edits }
                }
                return game
            })
            return games.find(game => game.id === args.id)
        }
    },
};

const server  = new ApolloServer({
    typeDefs,
    resolvers
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(`Server ready at ${url}`);