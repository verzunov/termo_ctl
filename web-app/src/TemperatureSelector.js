import React, {useState, useEffect} from 'react';
import { gql, useQuery,useMutation } from '@apollo/client';
const GET_TEMP = gql`
query GetTemperature($qnt: Int) {
    getTemperature(qnt: $qnt) {
      timestamp
      temperature
    }
  }
`;
const SET_TEMPERATURE = gql`
mutation SetTemperature($temperature: Float) {
    setTemperature(temperature: $temperature)
  }
`;

function TemperatureLogs({ children }) {
    const { loading, error, data } = useQuery(GET_TEMP, {
      variables: { qnt: 1 }
    });
    
    return children({ loading, error, data });
}

function TemperatureSelector() {
    return (
        <TemperatureLogs>
          {({ loading, error, data }) => {
              console.log(data);
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;
            return <TemperatureComponent data={data} />;
          }}
        </TemperatureLogs>
      );
  }


  
  function TemperatureComponent({ data }) {
    const [temperature, setTemperature] = useState(20);
    const [setTempMutation] = useMutation(SET_TEMPERATURE);
  
    useEffect(() => {
      if (data && data.getTemperature && data.getTemperature.length > 0) {
        setTemperature(data.getTemperature[0].temperature);
      }
    }, [data]);
  
    const handleSliderChange = async (event) => {
      const newTemperature = parseFloat(event.target.value);
      setTemperature(newTemperature);
  
      try {
        await setTempMutation({ variables: { temperature: newTemperature } });
      } catch (error) {
        console.error('Ошибка при установке температуры:', error);
      }
    };
  
    return (
      <div>
        <input
          type="range"
          style={{  width: "100%",
                    background: "#74A9D8;",
                    border: "0px solid rgba(0, 99, 132, 0.2);" }}
          min="10"
          max="30"
          value={temperature}
          onChange={handleSliderChange}
        />
        <p>Selected Temperature: {temperature}°C</p>
      </div>
    );
  }
  
  export default TemperatureSelector;