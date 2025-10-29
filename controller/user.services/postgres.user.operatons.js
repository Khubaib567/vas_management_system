const dns = require('dns');
const {generateToken,removeToken} = require('../../utils/json.token')


const createUserFromPostgreSQLdb = async (req , res , db) => {
    try {
    // USE OBJECT DESTRUCTION FOR EASILY ACCESS REQ BODY PARAMETER.
    
    const {name , operator = null , subscription = false , msisdn , services = null, role = null } = req.body;

    // SAVE USER IN THE DATABASE

    await db.query('INSERT INTO users (name, operator, subscription , msisdn , services , role) VALUES ($1, $2, $3 , $4 , $5 , $6)', [name, operator, subscription , msisdn , services , role])

    // FETCH THE NEWLY CREATED USER USING FINDONE
  
    const user = await db.query('SELECT * FROM users WHERE msisdn = $1' , [msisdn])
    // console.log("User Id: " , user[0].id)

   
    // GENERATE TOKEN 
    const token = await generateToken(res, user[0].id);
    // console.log("Token: ", token)
    // UPDATE THE USER WITH INSERT THE TOKEN
    await db.query('UPDATE users SET token = $1 WHERE id =$2' , [token , user[0].id]);

    const updatedUser = await db.query('SELECT * FROM users WHERE msisdn = $1' , [msisdn])
    // console.log('UpdatedUser: ' , updatedUser)
    return updatedUser;
        
    } catch (error) {
        throw new Error(error.message);
    }
}

const getAllUserFromPostgreSQLdb = async (req , db) =>{
    try {

        const { page = 1, limit = 10 , msisdn = null } = req.query; // Default: page 1, limit 10
        const offset = (page - 1) * limit;

        // console.log('Msisdn:' , msisdn)

        if(msisdn) {

          const data = await db.query(
            'SELECT * FROM users WHERE msisdn = $1 ORDER BY id ASC LIMIT $2 OFFSET $3',
            [msisdn , parseInt(limit), parseInt(offset)]
          );

          return data;

        }

        // const data = await db.query('SELECT * FROM users ORDER BY id ASC');

       const data = await db.query(
          'SELECT * FROM users ORDER BY id ASC LIMIT $1 OFFSET $2',
          [parseInt(limit), parseInt(offset)]
       );

       
      return data

        
    } catch (error) {
        throw new Error("Error find the users : " , err.message)
    }
}


const getUserBasedOnMsisdnFromPostreSQLdb = async (msisdn,db) => {
    try {
        // console.log('Id: ' , id)
        const data = await db.query("SELECT * FROM users WHERE msisdn = $1" , [msisdn])
        return data;   
        
    } catch (error) {
        throw new Error("Error during retrieve the user with mssidn " + msisdn)
    }
}



const getOneUserFromPostgreSQLdb = async (id,db) => {
    try {
        // console.log('Id: ' , id)
        const data = await db.query("SELECT * FROM users WHERE id = $1" , [id])
        return data;   
        
    } catch (error) {
        throw new Error("Error during retrieve the user with id " + id)
    }
}


const updateUserFromPostreSQLdb = async (req,id,db) => {
    
    try {
    //  console.log('ID: ', id)
     const {name , operator = null , subscription = null , msisdn , services = null, role = null } = req.body;
     await db.query('UPDATE users SET name = $1, operator = $2, subscription = $3 , msisdn = $4, services = $5 , role = $6 WHERE id = $7', [name , operator , subscription, msisdn , services , role , id])
     const user = await db.query('SELECT * FROM users WHERE id = $1' , [id])
     return user
    } catch (error) {
      throw new Error(error.message)
    }

}

const deleteUserFromPostgreSQLdb = async (req,res,id,db) => {
    
    try {
        
        await db.query('DELETE FROM users WHERE id = $1' , [id]);
        await removeToken(req, res);

    } catch (error) {
      throw new Error("Error find the User : " , err.message)
    }

}


const deleteAllUserFromPostgreSQLdb = async (db) => {
    try {
        await db.query('DELETE FROM users');
        await removeToken(req, res);
    } catch (error) {
      throw new Error("Error find the User : " , err.message)
    }

}


const findAllUpdatedUserFromPostgreSQLdb = async (db) => {
    try {
      const data = await db.query('SELECT * FROM users WHERE subscription = true');
      return data;
    } catch (error) {
      throw new Error("Error find the users : " , err.message)
    }

}

const updateUserinBulkFromPostgreSqldb = async (db) =>{
 
  try {

    await db.query('UPDATE users SET subscription = true WHERE subscription = false')
  
    
  } catch (error) {
     throw new Error("Error updating Users in bulk: " , error.message)
  }
}


module.exports = {createUserFromPostgreSQLdb,getAllUserFromPostgreSQLdb,getOneUserFromPostgreSQLdb,updateUserFromPostreSQLdb,deleteUserFromPostgreSQLdb,deleteAllUserFromPostgreSQLdb , findAllUpdatedUserFromPostgreSQLdb,updateUserinBulkFromPostgreSqldb , getUserBasedOnMsisdnFromPostreSQLdb}