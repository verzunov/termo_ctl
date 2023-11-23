import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { gql, useQuery } from '@apollo/client';

// Запрос GraphQL
const GET_LOGS = gql`
  query GetLogs($qnt: Int) {
    log(qnt: $qnt) {
      timestamp
      temperature
      powerState
    }
  }
`;
function TemperatureLogs({ children }) {
    const { loading, error, data } = useQuery(GET_LOGS, {
      variables: { qnt: 60 }
    });
  
    return children({ loading, error, data });
  }
  function TemperatureChart() {
    return (
      <TemperatureLogs>
        {({ loading, error, data }) => {
            console.log(error);
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error :(</p>;
          
          return <ChartComponent data={data} />;
        }}
      </TemperatureLogs>
    );
  }
  
  function ChartComponent({ data }) {
    const chartRef = useRef(null);
    const [chart, setChart] = useState(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!data || !chartRef.current) return;
      
        // Уничтожение предыдущего экземпляра графика
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      

      const labels = data.log.map(entry => new Date(entry.timestamp).toLocaleString());
      const temperatures = data.log.map(entry => entry.temperature);
  
      const ctx = chartRef.current.getContext('2d');
      const tempChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperature',
            data: temperatures,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
  
      chartInstanceRef.current = tempChart;

      return () => {
        // Уничтожение графика при размонтировании компонента
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [data]);
    
  
    return <canvas ref={chartRef} width="400" height="400"></canvas>;
  }
  
  export default TemperatureChart;
    