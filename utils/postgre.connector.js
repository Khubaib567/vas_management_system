
const {neon} = require('@neondatabase/serverless')

// IMPORT THE .ENV VARIABLES IN DEVELOPMENT ENVIRONMENT.
if(process.env.NODE !=="production"){
  require('dotenv').config({path: '../.secrets/.env'})
}


module.exports = postgreSQLConnector = async () =>{
    try {
        const DATABASE_URL = process.env.POSTRESQL_DATABASE_URL
        const sql = neon(DATABASE_URL);
        // const response = await sql`SELECT version()`;
        // console.log('response: ' , typeof(sql))
        return sql
        
    } catch (error) {
        throw new Error(error.message)
    }


}