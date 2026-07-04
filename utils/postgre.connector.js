
const {neon} = require('@neondatabase/serverless')
const Sequelize = require("sequelize");

// IMPORT THE .ENV VARIABLES IN DEVELOPMENT ENVIRONMENT.
if(process.env.NODE !=="production"){
  require('dotenv').config({path: '../.secrets/.env'})
}


module.exports = postgreSQLConnector = async () =>{
    try {

        
        // 1. Parse and fix the environment variable string
        const DATABASE_URL = process.env.POSTRESQL_DATABASE_URL
        const dbUrl = new URL(DATABASE_URL);
        
        // 2. Parse it safely using the native URL class

        // 3. Extract and encode the password field dynamically
        dbUrl.password = encodeURIComponent(dbUrl.password);
        
         
        // 4. Convert it back to a clean string
        const safeNeonUri = dbUrl.toString();
        
        
        // console.log("DATABASE URL: " , DATABASE_URL);
        // const sequelize = new Sequelize(DATABASE_URL);

        // const db = {};
        // db.Sequelize = Sequelize;
        // db.sequelize = sequelize;
        // db.users = require("../model/user.model.js")(sequelize, Sequelize);
        // db.services = require('../model/service.model.js')(sequelize, Sequelize);
        
        // db.users.hasMany(db.services,{onDelete: 'CASCADE', onUpdate: 'CASCADE' });
        // db.services.belongsTo(db.users,{onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        
       

        // CHECK THE DB CONNECTION.
        // await db.sequelize.sync({alter:true})
        const sql = neon(safeNeonUri);
        // const response = await sql`SELECT version()`;
        // console.log('response: ' , typeof(sql))
        return sql
        
    } catch (error) {
        throw new Error(error.message)
    }


}