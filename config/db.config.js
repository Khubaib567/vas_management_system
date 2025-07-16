// IMPORT THE .ENV VARIABLES IN DEVELOPMENT ENVIRONMENT.
if(process.env.NODE !=="production"){
  require('dotenv').config({path: '../.secrets/.env'})
}

// INITIZALIE THE SEQUELIZE LIBRARY FOR MAKING THE DB CONNECTION.
const Sequelize = require("sequelize");
// IMPORT NECCESSARY DB CREDENTIALS.
const database = process.env.DATABASE;
const user_name = process.env.USER_NAME;
const password = process.env.PASSWORD;

// DB_CLIENT INSTANCE BY USING SEQUELIZE DEFAULT OBJECT CONSTRUCTOR.
const sequelize = new Sequelize(database, user_name, password, {
  host: 'localhost',
  dialect: 'mysql',

});

// INITIALIZE DB INSTANCE AS OBJECT WHICH CONTAINS ALL THE TABLES WITH IT'S RELATION WITH OTHER TABLES.
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = require("../model/user.model.js")(sequelize, Sequelize);
db.projects = require('../model/project.model.js')(sequelize, Sequelize);

db.users.hasMany(db.projects,{onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.projects.belongsTo(db.users,{onDelete: 'CASCADE', onUpdate: 'CASCADE' })


// CHECK THE DB CONNECTION.
db.sequelize.sync({alter:true})
  .then(() => {
    console.log("Connected with database.");
})
  .catch((err) => {
    console.log("Failed to Connected with database: " + err);
});


// TO CLEAN THE DATABASE.
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

module.exports = db;





