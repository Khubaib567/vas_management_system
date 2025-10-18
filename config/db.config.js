
const postgreSQLConnector = require('../utils/postgre.connector.js')
const sqlConnector = require("../utils/sql.connector.js");
const  mongodbConnector   = require("../utils/mongo.connector.js")


module.exports = db_connector = async () => {

  try {
   const db = await postgreSQLConnector();
   console.log('Connected with PostrgreSQL');
   return db;
  } catch (error) {
    console.log(`${error.message}`)
    console.log('Connecting with MYSQL Connector......')
    try {
      const db = await sqlConnector();
      console.log('Connected with MYSQL.');
      return db;
    } catch (error) {
      console.log(`${error.message}`)
      console.log('Connecting with Mongodb Connector......')
      try {
          const db = await mongodbConnector();
          console.log('Connected with Mongodb.');
          return db;
      } catch (error) {
         throw new Error(error.message);
      }
    }
  }

}


// db_connector();
// module.exports = db;





