// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : './.secrets/.env'})
}

// IMPORTED NECESSARY LIBRARIES.
const express = require("express");
const logger = require("morgan");
const app = express();
const {limiter} = require("./utils/rate.limiter.js");
const helmet = require("helmet");
const cors = require("cors");
const redis = require("redis");
const { startDenoProxy } = require("./utils/deno.proxy.js");

// TRUSTED VERCEL & DENO FIREWALL 
app.set('trust proxy' , 1)

// PARSE REQUESTS OF CONTENT-TYPE - APPLICATION/JSON
app.use(express.json());

// PARSE REQUESTS OF CONTENT-TYPE - APPLICATION/X-WWW-FORM-URLENCODED
app.use(express.urlencoded({ extended: true }));

// app.use(startDenoProxy);

// APPLY RATE-LIMIT AS MIDDLEWARE
app.use(limiter)

// LISTEN REQUEST FROM DIFFERENT ORIGIN
app.use(cors())

// CONFIG HELMET TO APPLY DEFAULT HEADER TO AN APP
app.use(helmet())

// CONFIG MORGAN FOR LOGGING REQUEST
app.use(logger("common"))

// SIMPLE ROUTE
app.get("/", (req,res) => {
  return res.json({ message: "Redirecting to Main Server..!" });
});

// SET ROUTES
require('./routes/user.routes.js')(app);
require('./routes/service.routes.js')(app);

// SET PORT, LISTEN FOR REQUESTS
const port = process.env.PORT || 3000;

// CONFIG AN EXPRESS APP TO LISTEN ON THE PORT
app.listen(port, () => {
  console.log(`Express Server is running natively on http://localhost:${port}`);
});
