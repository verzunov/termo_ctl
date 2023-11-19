const { ApolloServer, gql } = require('apollo-server');
const { MongoClient } = require('mongodb');

const desiredTemperature = 18.0;
const hysteresis=0.5;
const mongoUrl = 'mongodb://mainSensor:jL6wGxZmyyq6gt@127.0.0.1:27017/termoCtl';


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

// Подключение к MongoDB
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

client.connect().then(() => {
  db = client.db('termoCtl'); // Замените 'your_db_name' на имя вашей базы данных
});

// Функция для записи данных в базу данных
async function logData(temperature, powerState) {
  const collection = db.collection('temperature_logs');
  await collection.insertOne({
    timestamp: new Date(),
    temperature,
    powerState
  });
}


const resolvers = {
    Query: {
      power: async (_, args) => {
        const powerState = control(args.temp);
        await logData(args.temp, powerState);
        return powerState;
      },
    },
  };
  
  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
    
