const {generateToken,removeToken} = require('../../utils/json.token');


const createUserFromSqldb = async (req , res , db) => {
    try {
    // USE OBJECT DESTRUCTION FOR EASILY ACCESS REQ BODY PARAMETER.
    const {name , msisdn , role , subscribe } = req.body;
    const User = db.users;

    // CREATE A USER OBJECT
    const obj = {
      name: name,
      msisdn : msisdn ,
      role : role ? role : "STUDENT" ,
      subscribe : subscribe ? subscribe : false
    };


    // SAVE USER IN THE DATABASE
    const data = await User.create(obj);

    // FETCH THE NEWLY CREATED USER USING FINDONE
    const user = await User.findOne({ where: { id: data.id } });
    
    if (!user || Array.isArray(user) && user.length === 0) {
       return res.status(404).json({ message: "User not found after creation" });
    }

    // GENERATE TOKEN 
    const token = await generateToken(res, user.id);
    // UPDATE THE USER WITH INSERT THE TOKEN
    const result = await user.update({ token });

    return result;
        
    } catch (error) {
        throw new Error('Error during create a user.' , error.message)
    }
}

const getAllUserFromSqldb = async (req , db) =>{
    try {


        const User = req.Users;

        const { page = 1, limit = 10 } = req.query; // Default: page 1, limit 10
        const offset = (page - 1) * limit;

        const data = await User.findAndCountAll({
            include: User,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });


        return data

        
    } catch (error) {
        throw new Error("Error find the users : " , err.message)
    }
}


const getOneUserFromSqldb = async(id,db) => {
    try {
    
        const User = db.users;
        const data = await User.findByPk(id, { include: User });
    
        if (!data || Array.isArray(data) && data.length === 0) {
        return res.status(404).json({ message: 'No data found' });
        }
        return data;   
    } catch (error) {
        throw new Error("Error find the User : " , err.message)
    }
}


const updateUserFromSqldb = async (req,id,db) => {
    
    try {
     const User = db.users;
     const data = await User.update(req.body, { where: { id: id } });
      return data
    } catch (error) {
      throw new Error("Error find the User : " , err.message)
    }

}

const deleteUserFromSqldb = async (req,res,id,db) => {
    
    try {
        const User = db.usersl
        await User.destroy({ where: { id: id } });
        await removeToken(req, res);

    } catch (error) {
      throw new Error("Error find the User : " , err.message)
    }

}


const deleteAllUserFromSqldb = async (db) => {
    try {
     const User = db.Users;
      await User.destroy({ where: {}, truncate: false });
    } catch (error) {
      throw new Error("Error find the User : " , err.message)
    }

}


const findAllUpdatedUserFromSqldb = async (db) => {
    try {
      const User = db.users;
      const data = await User.findAll({ where: { subscribe: true } });;
      return data;
    } catch (error) {
      throw new Error("Error find the users : " , err.message)
    }

}

const updateUserinBulkFromSqldb = async (req,db) =>{
 
  try {

    const subscription = req.body.subscription
    const User = db.users;

    const data = await User.update({ subscription : false } , 
      {
        where : {
            subscription : subscription
        }
      })

     return data;
    
  } catch (error) {
     throw new Error("Error updating Users in bulk: " , error.message)
  }
}


module.exports = {createUserFromSqldb,getAllUserFromSqldb,getOneUserFromSqldb,updateUserFromSqldb,deleteUserFromSqldb,deleteAllUserFromSqldb,findAllUpdatedUserFromSqldb,updateUserinBulkFromSqldb}