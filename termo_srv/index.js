const { ApolloServer, gql } = require('apollo-server');
const { MongoClient } = require('mongodb');


const hysteresis=0.5;
const mongoUrl = 'mongodb://mainSensor:jL6wGxZmyyq6gt@127.0.0.1:27017/termoCtl';
let powerOn=false;


async function control(currentTemperature){
  let temp =  await getTemperature(1);
  const desiredTemperature =temp[0].temperature;
  currentTemperature=+currentTemperature;
  console.log(desiredTemperature);
  console.log(currentTemperature);
  if (currentTemperature < desiredTemperature - hysteresis) {
    powerOn=true; // Включить нагреватель
  } else if (currentTemperature > desiredTemperature + hysteresis) {
    powerOn=false; // Выключить нагреватель
  }
  return powerOn;
}
const typeDefs = gql`
  scalar Date
  type Note{
    timestamp: Date!
    temperature: Float!
    powerState: String
  }
  type Temp{
    timestamp:Date!
    temperature:Float!
  }
    type Query {
    power(temp: String): String
    log (qnt: Int):[Note]
    getTemperature(qnt: Int):[Temp]
  }
  type Mutation {
    setTemperature(temperature: Float): Boolean
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
async function setTemperature(temperature){
  const collection = db.collection('temperature_val');
  await collection.insertOne({
    timestamp: new Date(),
    temperature
  });
  return true;
}
async function getTemperature(qnt){
  const collection = db.collection('temperature_val');
  const res= await collection.find().sort({timestamp:-1}).limit(qnt).toArray()
  return res;
}
async function getData(qnt)
{
  const collection = db.collection('temperature_logs');
  return await collection.find().sort({timestamp:-1}).limit(qnt).toArray()
}
const resolvers = {
    Query: {
      power: async (_, args) => {
        const powerState = await control(args.temp) ? "1":"0";
        await logData(args.temp, powerState);
        return powerState;
      },
      log: async (_, args)=>{
        const records=await getData(args.qnt);
        return records;
      },
     getTemperature: async (_, args)=>{
        const lastTemperature = await getTemperature(args.qnt);
        return lastTemperature;
     }
    },
    Mutation:{
      setTemperature: async(_, args)=>{
        return setTemperature(args.temperature);
      }
    }
  };
  
  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
    
