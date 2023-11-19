const { ApolloServer, gql } = require('apollo-server');
const desiredTemperature = 18.0;
const hysteresis=0.5;

function control(currentTemperature){
  currentTemperature=+currentTemperature;
  console.log(currentTemperature);
  if (currentTemperature < desiredTemperature - hysteresis) {
    return "1"; // Включить нагреватель
  } else if (currentTemperature > desiredTemperature + hysteresis) {
    return "0"; // Выключить нагреватель
  }
}
const typeDefs = gql`
  type Query {
    power(temp: String): String
  }
`;


const resolvers = {
    Query: {
      power: (_, args) => control(args.temp),
    },
  };
  
  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
    
