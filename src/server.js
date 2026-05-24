// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : './.secrets/.env'})
}

// IMPORTED NECCESSARY LIBRARIES.
const express = require("express");
const logger = require("morgan");
const app = express();
const {limiter} = require("../utils/rate.limiter.js");
const helmet = require('helmet');
const cors = require('cors');
const redis = require('redis')


app.set('trust proxy' , 1)

// APPLY RATE-LIMIT AS MIDDLEWARE
app.use(limiter)


// LISTEN REQUEST FROM DIFFERENT ORIGIN
app.use(cors())

// CONFIG HELMET TO APPLY DEFAULT HEADER TO AN APP
app.use(helmet())

// CONFIG MORGAN FOR LOGGING REQUEST
app.use(logger("common"))

// PARSE REQUESTS OF CONTENT-TYPE - APPLICATION/JSON
app.use(express.json());

// PARSE REQUESTS OF CONTENT-TYPE - APPLICATION/X-WWW-FORM-URLENCODED
app.use(express.urlencoded({ extended: true }));


// SIMPLE ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Redirecting to Main Server..!" });
});

// SET PORT, LISTEN FOR REQUESTS
require('../routes/user.routes.js')(app)
require('../routes/service.routes.js')(app)

// CONFIG AN EXPRESS APP ON LOCALHOST IN DEVELOPMENT ENV.
app.listen(process.env.PORT || 3000, function () {
  const { port, address } = this.address();
  const host = address === '::' ? 'localhost' : address;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  console.log(`Internal Node Server running at ${protocol}://${host}:${port}`);
});



