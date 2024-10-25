const axios = require('axios');
const Weather = require('../models/weather.model');
const DailySummary = require('../models/dailysummary.model');
const dotenv = require('dotenv');
dotenv.config();
const fetchWeatherData = async (city) => {
    try {
      
      key=process.env.OPEN_WEATHER_API_KEY;
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`);
      // console.log(response.data);
      const temp_celsius = (response.data.main.temp - 273.15).toFixed(2);
      const feels_like_celsius = (response.data.main.feels_like - 273.15).toFixed(2);
      const temp_min_celsius = (response.data.main.temp_min - 273.15).toFixed(2);
      const temp_max_celsius = (response.data.main.temp_max - 273.15).toFixed(2);
      const pressure = response.data.main.pressure;
      const humidity = response.data.main.humidity;
      const wind_speed = response.data.wind.speed;
      const condition = response.data.weather[0].main;
  
      const weatherData = new Weather({
        city,
        temp: temp_celsius,
        feels_like: feels_like_celsius,
        temp_min: temp_min_celsius,
        temp_max: temp_max_celsius,
        pressure,
        humidity,
        wind_speed,
        condition,
      });
      // console.log(weatherData);
      await weatherData.save();
    } catch (error) {
      console.error(`Error fetching weather for ${city}: ${error.message}`);
    }
  };

  const calculateDailySummary = async (city) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
  
    const weatherData = await Weather.find({ city, timestamp: { $gte: startOfDay } });
    if (weatherData.length === 0) {
      const previousDaySummary = await DailySummary.findOne({
          city,
          date: {
              $gte: new Date(startOfDay.setDate(startOfDay.getDate() - 1)),
              $lt: startOfDay
          }
      });
      if (!previousDaySummary) return;
      return previousDaySummary;
  }
  
    const minTemp = Math.min(...weatherData.map(data => data.temp));
    const maxTemp = Math.max(...weatherData.map(data => data.temp));
    const avgTemp = weatherData.reduce((sum, data) => sum + data.temp, 0) / weatherData.length;
    const avgHumidity = weatherData.reduce((sum, data) => sum + data.humidity, 0) / weatherData.length;
    const avgPressure = (weatherData.reduce((sum, data) => sum + data.pressure, 0) / weatherData.length).toFixed(2);
    const avgWindSpeed = (weatherData.reduce((sum, data) => sum + data.wind_speed, 0) / weatherData.length).toFixed(2);
    const conditions = weatherData.map(data => data.condition);
    const dominantCondition = conditions.sort((a, b) => 
      conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
    ).pop();
  
    const dailySummary = new DailySummary({
      city,
      min_temp: minTemp,
      max_temp: maxTemp,
      avg_temp: avgTemp,
      avg_humidity: avgHumidity,
      avg_pressure: avgPressure,
      avg_wind_speed: avgWindSpeed,
      dominant_condition: dominantCondition,
      date: startOfDay
    });
  
    await dailySummary.save();
  };
  const getDailySummaryData = async (city) => {
    try {
      const summary = await DailySummary.find({ city }).sort({ date: -1 });
      if (summary.length === 0) {
        return null;
      }
      return summary[summary.length - 1];
    } catch (error) {
      throw new Error('Error retrieving daily summary data');
    }
  };
  const getStartAndEndOfMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
    return {
        startOfMonth: Math.floor(start.getTime() / 1000), // Convert to Unix timestamp
        endOfMonth: Math.floor(end.getTime() / 1000),
    };
};
  const fetchConditionCount=async(city)=>{
    try{
      key=process.env.OPEN_WEATHER_API_KEY;
      const {startOfMonth,endOfMonth}=getStartAndEndOfMonth();
      const weatherResponse = await axios.get(`https://pro.openweathermap.org/data/2.5/forecast/climate?`, {
        params: {
          q:city,
          start: startOfMonth, 
          end: endOfMonth, 
          appid: key,
        },
      });
      if (weatherResponse.status === 200) {
        const weatherData = weatherResponse.data;

        // Initialize counts
        let rainCount = 0;
        let clearCount = 0;

        // Loop through the list of weather data to count occurrences
        weatherData.list.forEach((entry) => {
          const weatherCondition = entry.weather[0].main; // Access the main weather condition
          if (weatherCondition === "Rain" || weatherCondition === "Drizzle" || weatherCondition === "Thunderstorm" || weatherCondition === "Tornado") {
            rainCount += 1;
          } else if (weatherCondition === "Clear" || weatherCondition === "Clouds" || weatherCondition === "Mist" || weatherCondition === "Haze" || weatherCondition === "Fog" || weatherCondition === "Smoke" || weatherCondition === "Dust" || weatherCondition === "Sand" || weatherCondition === "Ash" || weatherCondition === "Squall" ) {
            clearCount += 1;
          }
        });
        const month = new Date().toLocaleString('default', { month: 'long' });
        return[
          {month,name:"Sunny/Cloudy",value:clearCount},
          {month,name:"Rainy",value:rainCount}]
      } else {
        console.error('Error fetching weather data:', weatherResponse.status);
      }
    }
    catch(error){
      console.error(`Error fetching weather for ${city}: ${error.message}`);
    }
  }
  const forecastWeather = async (city) => {
    try {
      console.log("City requested:", city);
      const Apikey = process.env.OPEN_WEATHER_API_KEY;
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=10&appid=${Apikey}`);
      
      const forecastData = response.data.list.map(day => ({
        date: new Date(day.dt * 1000).toLocaleDateString(), 
        temp: (day.temp.day - 273.15).toFixed(0),
        minTemp: (day.temp.min - 273.15).toFixed(0),
        maxTemp: (day.temp.max - 273.15).toFixed(0),
        climateIcon: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
        main: day.weather[0].main,
      }));
  
      console.log("Forecast Data:", forecastData); 
      return forecastData; 

    } catch (error) {
      console.error(`Error fetching weather for ${city}: ${error.message}`);
    }
  };
  const fetchHourlyWeatherData = async (city) => {
    try {
      console.log("City requested:", city);
      const Apikey = process.env.OPEN_WEATHER_API_KEY;
      const response = await axios.get(`https://pro.openweathermap.org/data/2.5/forecast/hourly?q=${city}&appid=${Apikey}&cnt=5`);
      const HourlyData=response.data.list.map(data => ({
        day: `Day ${new Date(data.dt * 1000).getUTCDate()}`, 
        hum: data.main.humidity,                              
        pres: data.main.pressure,                            
        temp: (data.main.temp - 273.15).toFixed(0),         
        wnd: data.wind.speed,                                
        vis: (data.visibility / 1000).toFixed(0),           
        prec: data.rain ? data.rain['1h'] : 0,    
        fl: (data.main.feels_like - 273.15).toFixed(0),     
        cld: data.clouds.all,                              
      }));
      return HourlyData;
    } catch (error) {
      console.error(`Error fetching weather data for ${city}: ${error.message}`);
    }
  };
  module.exports = {
    fetchWeatherData,
    calculateDailySummary,
    getDailySummaryData,
    fetchConditionCount,
    forecastWeather,
    fetchHourlyWeatherData
  }