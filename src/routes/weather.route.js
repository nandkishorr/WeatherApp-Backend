const express = require('express');
const router = express.Router();
const {getCurrentWeatherData,getHourlyForecastData,getDailyForecastData,getDailyWeatherData,getDailySummaryData} =require('../controllers/healthstatus.contoller')
router.route('/').get(getCurrentWeatherData)


module.exports = router;