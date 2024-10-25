const { fetchWeatherData,calculateDailySummary,getDailySummaryData,fetchConditionCount,forecastWeather,fetchHourlyWeatherData} = require('../services/weather.services');

const fetchWeather = async (city) => {
    try {
      await fetchWeatherData(city);
      console.log(`Weather data for ${city} fetched and saved.`);
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error);
    }
  };

  const DailySummary = async (city) => {
    try {
      await calculateDailySummary(city);
      console.log(`Daily summary data for ${city} is calculated and saved.`);
    } catch (error) {
       console.error('Error fetching weather data', error);
    }
  };

  const getDailySummary = async (req, res) => {
    try {
      const city = req.body.city;
      console.log("City requested:", city);
      const summary = await getDailySummaryData(city);
      if (!summary) {
        return res.status(404).json({ error: 'No daily summary data found' });
      }
      res.status(200).json(summary);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  const getClimateCount = async (req, res) => {
    try {
      const city = req.body.city;
      console.log("City requested:", city);
      const result = await fetchConditionCount(city);
      if (!result) {
        return res.status(404).json({ error: 'No result found' });
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching  result:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  const forecastWeatherData = async (req, res) => {
    try {
      const city = req.body.city;
      console.log("City requested:", city);
      const forecast = await forecastWeather(city);
      if (!forecast) {
        return res.status(404).json({ error: 'No daily forecast data found' });
      }
      res.status(200).json(forecast);
    } catch (error) {
      console.error('Error fetching 10 day forecast:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  const fetchHourlyData = async (req,res) => {
    try {
      const city = req.body.city;
      console.log("City requested:", city);
      const HourlyData =await fetchHourlyWeatherData(city);
      console.log(HourlyData);
      if (!HourlyData) {
        return res.status(404).json({ error: 'No HourlyData forecast found' });
      }
      res.status(200).json(HourlyData);
      console.log(`Hourly weather data for ${city} fetched and saved.`);
    } catch (error) {
      console.error(`Error fetching hourly weather data for ${city}:`, error);
    }
  };
module.exports = {
    fetchWeather,
    DailySummary,
    getDailySummary,
    getClimateCount,
    forecastWeatherData,
    fetchHourlyData
}
