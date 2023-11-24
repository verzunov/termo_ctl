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
    const { loading, error, data, refetch } = useQuery(GET_LOGS, {
      variables: { qnt: 60 },
      pollInterval: 60000, // Опрос данных каждую минуту
    });
  
    useEffect(() => {
      // Запуск таймера для периодического обновления данных
      const intervalId = setInterval(() => {
        refetch(); // Вызов refetch для повторного выполнения запроса
      }, 60000); // Интервал в миллисекундах (60000 мс = 1 минута)
  
      return () => clearInterval(intervalId); // Очистка интервала при размонтировании компонента
    }, [refetch]);
  
    return (
      <TemperatureLogs>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error :(</p>;
  
          return <ChartComponent data={data} />;
        }}
      </TemperatureLogs>
    );
  }
  
function getFilledUpArray(array) {
    array=array.reverse();
    let lastDefinedElement;
    return array.map(element => {
        if (element === null) {
            element = lastDefinedElement; 
        }
        
        lastDefinedElement = element;
        return element;
    }).reverse();    
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
      

      const labels = data.log.map(entry => {
        const date = new Date(entry.timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month} ${hours}:${minutes}`;
      });
      const temperatures = data.log.map(entry => entry.temperature);
      const powerState = getFilledUpArray(data.log.map(entry => entry.powerState));

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
          },
        {
            label: 'Power State',
            data: powerState,
            backgroundColor: 'rgba(0, 99, 132, 0.2)',
            borderColor: 'rgba(0, 99, 132, 1)',
            borderWidth: 1
        }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            },
            x: {
                reverse: true, // Разворачиваем ось X
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
    