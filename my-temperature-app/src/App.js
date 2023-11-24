import React from 'react';
import TemperatureChart from './TemperatureChart';
import TemperatureSelector from './TemperatureSelector'
import { ApolloProvider } from '@apollo/client';
import client from './ApolloClient'; // Путь к файлу с настройками клиента
  
function App() {
    return (
        <ApolloProvider client={client}>
                <div className="App">
            <TemperatureChart />
            <TemperatureSelector />
        </div>
      </ApolloProvider>

    );
}

export default App;
