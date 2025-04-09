import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactAnimatedWeather from "react-animated-weather";


function Forecast({ weather }) {
  const { data } = weather;
  const [forecastData, setForecastData] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchForecastData = async () => {
      if (!data.city) {
        console.warn("No city provided for forecast");
        return;
      }

      const apiKey = import.meta.env.VITE_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${data.city}&appid=${apiKey}&units=metric`;
      console.log("Forecast URL:", url);

      try {
        const response = await axios.get(url);
        console.log("Forecast API response:", response.data);

        if (response.data.list && Array.isArray(response.data.list)) {
          const list = response.data.list;
          const dailyForecast = [];

          if (list.length >= 40) {
            for (let i = 7; i < list.length; i += 8) {
              const forecast = list[i];
              dailyForecast.push({
                time: forecast.dt,
                temperature: {
                  minimum: forecast.main.temp_min,
                  maximum: forecast.main.temp_max,
                },
                condition: {
                  description: forecast.weather[0].description,
                  icon_url: `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`,
                },
              });
            }
            setForecastData(dailyForecast);
          } else {
            console.warn("Not enough forecast data in list", list);
            setErrorMsg("Not enough forecast data available.");
          }
        } else {
          console.warn("Unexpected forecast data structure", response.data);
          setErrorMsg("Unexpected data format from API.");
        }
      } catch (error) {
        console.error("Error fetching forecast data:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          setErrorMsg(`Error ${error.response.status}: ${error.response.data.message || "Unauthorized"}`);
        } else {
          setErrorMsg("Network error or server is not responding.");
        }
      }
    };

    fetchForecastData();
  }, [data.city]);

  const formatDay = (timestamp) => {
    const options = { weekday: "short" };
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", options);
  };

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius((prevState) => !prevState);
  };

  const convertToFahrenheit = (temperature) => {
    return Math.round((temperature * 9) / 5 + 32);
  };

  const renderTemperature = (temperature) => {
    return isCelsius
      ? Math.round(temperature)
      : convertToFahrenheit(temperature);
  };

  return (
    <div>
      <div className="city-name">
        <h2>
          {data.city}, <span>{data.country}</span>
        </h2>
      </div>
      <div className="date">
        <span>{getCurrentDate()}</span>
      </div>
      <div className="temp">
        {data.condition.icon_url && (
          <img
            src={data.condition.icon_url}
            alt={data.condition.description}
            className="temp-icon"
          />
        )}
        {renderTemperature(data.temperature.current)}
        <sup className="temp-deg" onClick={toggleTemperatureUnit}>
          {isCelsius ? "°C" : "°F"} | {isCelsius ? "°F" : "°C"}
        </sup>
      </div>
      <p className="weather-des">{data.condition.description}</p>
      <div className="weather-info">
        <div className="col">
          <ReactAnimatedWeather icon="WIND" size="40" />
          <div>
            <p className="wind">{data.wind.speed} m/s</p>
            <p>Wind speed</p>
          </div>
        </div>
        <div className="col">
          <ReactAnimatedWeather icon="RAIN" size="40" />
          <div>
            <p className="humidity">{data.temperature.humidity}%</p>
            <p>Humidity</p>
          </div>
        </div>
      </div>
      <div className="forecast">
        <h3>5-Day Forecast:</h3>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <div className="forecast-container">
          {forecastData && forecastData.length > 0 ? (
            forecastData.map((day, index) => (
              <div className="day" key={index}>
                <p className="day-name">{formatDay(day.time)}</p>
                {day.condition && day.condition.icon_url && (
                  <img
                    className="day-icon"
                    src={day.condition.icon_url}
                    alt={day.condition.description}
                  />
                )}
                <p className="day-temperature">
                  {Math.round(day.temperature.minimum)}° /{" "}
                  <span>{Math.round(day.temperature.maximum)}°</span>
                </p>
              </div>
            ))
          ) : (
            <p>No forecast data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Forecast;
