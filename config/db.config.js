const CircuitBreaker = require('opossum');
const postgreSQLConnector = require('../utils/postgre.connector.js');
const sqlConnector = require("../utils/sql.connector.js");
const mongodbConnector = require("../utils/mongo.connector.js");

// 1. Define the primary action (Try PostgreSQL)
const primaryOptions = {
  timeout: 3000,          // If Postgres takes > 3s, count as a failure
  errorThresholdPercentage: 50, // Trip if 50% of recent requests fail
  resetTimeout: 10000     // Stay OPEN for 10 seconds before trying Postgres again
};

const postgresBreaker = new CircuitBreaker(postgreSQLConnector, primaryOptions);

// 2. Define what happens when the Circuit Breaker is OPEN or Fails
postgresBreaker.fallback(async (error) => {
  console.log(`[Breaker Fallback triggered due to: ${error.message}]`);
  console.log('Routing instantly to MySQL...');
  
  try {
    return await sqlConnector();
  } catch (mysqlError) {
    console.log(`MySQL failed: ${mysqlError.message}. Routing to MongoDB...`);
    return await mongodbConnector();
  }
});

// 3. Export the execution wrapper
module.exports = db_connector = async () => {
  // fire() will automatically decide whether to call Postgres or instantly skip to the fallback!
  return await postgresBreaker.fire();
};
