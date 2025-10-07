// IMPORT THE .ENV VARIABLES IN DEVELOPMENT ENVIRONMENT.
if(process.env.NODE !=="production"){
  require('dotenv').config({path: '../.secrets/.env'})
}

// INITIZALIE THE SEQUELIZE LIBRARY FOR MAKING THE DB CONNECTION.
const Sequelize = require("sequelize");
const  mongodbConnector   = require("../utils/mongodb.js")

module.exports = db_connector = async () => {

  try {
      // IMPORT NECCESSARY DB CREDENTIALS.
      const database = process.env.DATABASE;
      const user_name = process.env.USER_NAME;
      const password = process.env.PASSWORD;

      // DB_CLIENT INSTANCE BY USING SEQUELIZE DEFAULT OBJECT CONSTRUCTOR.
      const sequelize = new Sequelize(database, user_name, password, {
        host: process.env.HOST_NAME,
        dialect: process.env.DIALECT,

      });

      // INITIALIZE DB INSTANCE AS OBJECT WHICH CONTAINS ALL THE TABLES WITH IT'S RELATION WITH OTHER TABLES.
      const db = {};
      db.Sequelize = Sequelize;
      db.sequelize = sequelize;
      db.users = require("../model/user.model.js")(sequelize, Sequelize);
      db.services = require('../model/service.model.js')(sequelize, Sequelize);

      db.users.hasMany(db.services,{onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      db.services.belongsTo(db.users,{onDelete: 'CASCADE', onUpdate: 'CASCADE' })


      // CHECK THE DB CONNECTION.
      await db.sequelize.sync({alter:true})
      // console.log(connection)

      return db;
      
    
  } catch (error) {
    console.error('Failed to Connected with MYSQL Connector :',error.message)
    console.log('Connecting with Mongodb Connector......')
    mongodbConnector()
  }


  // TO CLEAN THE DATABASE.
  // db.sequelize.sync({ force: true }).then(() => {
  //   console.log("Drop and re-sync db.");
  // });

}


db_connector()

// module.exports = db;





