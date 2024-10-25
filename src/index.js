const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const dotenv = require('dotenv');
const connectToDb =require('./config/Connection'); 
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3001;
// Middleware
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectToDb();
//cron job
require('./jobs/fetchweather.job');
require('./jobs/dailysummary.job');
// Routes
const Routes = require('./routes/weather.route');
 app.use('/', Routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});