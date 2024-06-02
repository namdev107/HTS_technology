require("dotenv").config();
const express = require("express");
const connectDB = require('./app/config/database.js'); 
const bodyParser = require('body-parser');
const routes = require('./app/routes/routes.js');

const app = express();

// Connect to database
connectDB();

app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '100mb',
    extended: true
}));


// Routes
app.use('/api/auth', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


