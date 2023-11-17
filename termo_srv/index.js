const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    power(temp: String): String
  }
`;


const resolvers = {
    Query: {
      power: (_, args) => args.temp < 40 ? '1':'0',
    },
  };
  
  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
    