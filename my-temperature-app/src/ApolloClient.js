import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Создание клиента Apollo
const client = new ApolloClient({
  uri: 'http://178.217.170.5:4000/', // URL вашего GraphQL сервера
  cache: new InMemoryCache()
});

export default client;
