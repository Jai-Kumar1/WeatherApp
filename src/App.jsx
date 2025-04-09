import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchEngine from "./SearchEngine";
import Forecast from "./Forecast";

import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({
    loading: true,
    data: {},
    error: false,
  });
  const [searchHistory, setSearchHistory] = useState([]);

  const toDate = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const currentDate = new Date();
    const date = `${days[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const transformWeatherData = (data) => {
    return {
      city: data.name,
      country: data.sys.country,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      condition: {
        description: data.weather[0].description,
        icon_url: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      },      
      temperature: {
        current: data.main.temp,
        humidity: data.main.humidity,
      },
      wind: {
        speed: data.wind.speed,
      },
    };
  };

  const search = async (event) => {
    event.preventDefault();
    if (
      event.type === "click" ||
      (event.type === "keypress" && event.key === "Enter")
    ) {
      setWeather({ ...weather, loading: true });
      const apiKey = import.meta.env.VITE_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;

      try {
        const res = await axios.get(url);
        const transformedData = transformWeatherData(res.data);
        setWeather({ data: transformedData, loading: false, error: false });

        setSearchHistory((prevHistory) => {
          const updatedHistory = [query, ...prevHistory.filter((city) => city !== query)];
          return updatedHistory.slice(0, 5);
        });
      } catch (error) {
        setWeather({ ...weather, data: {}, error: true, loading: false });
        console.error("Error fetching weather data:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiKey = import.meta.env.VITE_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Bhubaneswar&appid=${apiKey}&units=metric`;
  
      console.log("Fetching initial data from:", url);
  
      try {
        const response = await axios.get(url);
        console.log("Initial data response:", response.data);
        const transformedData = transformWeatherData(response.data);
        setWeather({ data: transformedData, loading: false, error: false });
      } catch (error) {
        console.error("Error fetching initial weather data:", error);
        setWeather({ data: {}, loading: false, error: true });
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className="App">
      {}
      <SearchEngine query={query} setQuery={setQuery} search={search} />

      {weather.loading && (
        <>
          <br /><br />
          <h4>Searching...</h4>
        </>
      )}

      {weather.error && (
        <>
          <br /><br />
          <span className="error-message">
            <span style={{ fontFamily: "font" }}>
              Sorry, city not found. Please try again.
            </span>
          </span>
        </>
      )}

      {weather.data && weather.data.condition && (

        <Forecast weather={weather} toDate={toDate} />
      )}

      {}
      <div className="search-history">
        <h4>Recent Searches:</h4>
        <ul>
          {searchHistory.map((city, index) => (
            <li key={index}>{city}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
