const dns = require('dns');
const {generateToken,removeToken,refreshToken} = require('../../utils/json.token')


const createUserFromPostgreSQLdb = async (body , res , db) => {
    try {
    // USE OBJECT DESTRUCTION FOR EASILY ACCESS REQ BODY PARAMETER.
    
    const {name , operator = null , subscription = true , msisdn , services = null, role = null } = body;

    // console.log('Name: ' , name)
    // console.log('Msisdn: ' , msisdn)


    // SAVE USER IN THE DATABASE

    await db.query('INSERT INTO users (name, msisdn , subscription  ) VALUES ($1, $2 , $3  )', [name, msisdn , subscription])

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
        // console.log('msisdn: ' , msisdn)
        const data = await db.query("SELECT * FROM users WHERE msisdn = $1" , [msisdn])
        console.log("User Retreived Data: " , data);
        return data;   
        
    } catch (error) {

        console.error("PostgreSQL Error Details:", error);
        throw new Error("Error during retrieve the user with mssidn " + msisdn)
    }
}


const setOtpBasedOnMsisdnFromPostreSQLdb = async (msisdn,otp,db) =>{
  try {

    await db.query('UPDATE users SET otp = $1 WHERE msisdn = $2' , [otp,msisdn])
    
  } catch (error) {
     throw new Error("Error during update the user's otp with mssidn " + msisdn)
  }
}



const getOneUserFromPostgreSQLdb = async (id,db) => {
    try {
        // console.log('Id: ' , id)
        const data = await db.query("SELECT * FROM users WHERE id = $1" , [id]);
        // console.log("User Data: " , data);
        return data;   
        
    } catch (error) {
        console.error("PostgreSQL Error Details:", error);
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
      throw new Error("Error find the User : " , error.message)
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

const updateUserinBulkFromPostgreSqldb = async (db , subscription) =>{
 
  try {

    await db.query('UPDATE users SET subscription = $1' , [subscription]);
    const users = await db.query('SELECT * FROM users WHERE subscription = $1' , [subscription]); 

    for (const user of users) {
      //  console.log('userid' , user.id)
       const token = await refreshToken(user.id)
       await db.query('UPDATE users SET token = $1 WHERE id =$2' , [token , user.id]);  
    }

    return true
  
    
  } catch (error) {
     throw new Error(error.message)
  }
}


module.exports = {createUserFromPostgreSQLdb,getAllUserFromPostgreSQLdb,getOneUserFromPostgreSQLdb,updateUserFromPostreSQLdb,deleteUserFromPostgreSQLdb,deleteAllUserFromPostgreSQLdb , findAllUpdatedUserFromPostgreSQLdb,updateUserinBulkFromPostgreSqldb , getUserBasedOnMsisdnFromPostreSQLdb , setOtpBasedOnMsisdnFromPostreSQLdb}