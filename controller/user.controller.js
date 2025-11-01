
if(process.env.NODE !== "production") {
  require("dotenv").config({path:"../.secrets/.env"})
}


// require("../.secrets/.env")


const db_connector = require("../config/db.config");
const {createUserFromSqldb , getAllUserFromSqldb , getOneUserFromSqldb , updateUserFromSqldb , deleteUserFromSqldb , deleteAllUserFromSqldb , findAllUpdatedUserFromSqldb, updateUserinBulkFromSqldb} = require("../controller/user.services/sql.user.operatons")
const {createUserFromPostgreSQLdb , getAllUserFromPostgreSQLdb , getOneUserFromPostgreSQLdb  , getUserBasedOnMsisdnFromPostreSQLdb ,updateUserFromPostreSQLdb , deleteUserFromPostgreSQLdb , deleteAllUserFromPostgreSQLdb , findAllUpdatedUserFromPostgreSQLdb , updateUserinBulkFromPostgreSqldb , setOtpBasedOnMsisdnFromPostreSQLdb} = require("../controller/user.services/postgres.user.operatons")
const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

redisClient.connect().then(() => {
  console.log("Connected to Redis");
});



// CREATE AND SAVE A NEW USER
exports.create = async (req, res) => {
  
  try {

    const db = await db_connector();
    // console.log('Reqbody: ' , req.body)

    if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }

    if(typeof(db) === "function") {
      const user = await createUserFromPostgreSQLdb(req , res , db)

      if (!user || Array.isArray(user) && user.length === 0) {
       return res.status(404).json({ message: "User not found after creation" });
      }

      res.status(200).send(user);
    }
       
    if(typeof(db) === "object"){

      const user = await createUserFromSqldb(req , res, db)
      res.status(200).send(user);

    }

    if (typeof(db) === "string") res.status(200).json({message : 'Create Route!'});
       
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};


// RETRIEVE ALL USERS FROM THE DATABASE.
exports.findAll = async (req, res) => {

try {

 const { page = 1, limit = 10 } = req.query; // Default: page 1, limit 10
 const db = await db_connector();
  // console.log(typeof(db) === String)

  if(typeof(db) === "function") {
    
    const users = await getAllUserFromPostgreSQLdb(req,db);

    // Calculate total items from the array's length
    const totalItems = users.length;

    // Calculate the start and end indices for slicing the array
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Use .slice() to get the users for the current page
    const usersForPage = users.slice(startIndex, endIndex);

    if (!users || Array.isArray(users) && users.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }
    
    res.status(200).json({
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        users: usersForPage
    });


  }
  
  if (typeof(db) === "object") {
    const users = await getAllUserFromSqldb(req,db)

   
    if (!users || Array.isArray(users) && users.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).json({
        totalItems: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: parseInt(page),
        users: users.rows
    });
  }
       
  if (typeof(db) === "string") res.status(200).json({message : 'Find All Route!'});

  } catch (err) {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving Users."
      });
    }

  
};

exports.findUser = async (req,res) =>{
  try {
    const { msisdn = null } = req.query;

    const db = await db_connector();

    if(typeof(db) === "function") {

      const user = await getUserBasedOnMsisdnFromPostreSQLdb(msisdn,db);
      if (!user || Array.isArray(user) && user.length === 0) {
          return res.status(404).json({ message: 'No data found' });
      }

      res.status(200).send(user)
    }

  } catch (error) {
    res.status(500).send({
      message: err.message 
    });
    
  }
}

exports.setOTP = async (req,res) =>{
  try {
    const { msisdn = null } = req.query;
    const {otp} = req.body

    const db = await db_connector();

    if(typeof(db) === "function") {

      await setOtpBasedOnMsisdnFromPostreSQLdb(msisdn,otp,db);
      res.status(200).send({
        message : "OTP has updated!"
      })
    }

  } catch (error) {
    res.status(500).send({
      message: err.message 
    });
    
  }
}



// FIND A SINGLE USER WITH AN ID
exports.findOne = async (req, res) => {
  
  try {
    const id = req.params.id;
    const db = await db_connector();

    if(typeof(db) === "function") {

      const user = await getOneUserFromPostgreSQLdb(id,db);
      if (!user || Array.isArray(user) && user.length === 0) {
          return res.status(404).json({ message: 'No data found' });
      }

      await redisClient.setEx(`:${id}`, 60, JSON.stringify(user));

      res.status(200).send(user)
    }

    if(typeof(db) === "object") {
         const user = await getOneUserFromSqldb(id,db);
        if (!user || Array.isArray(user) && user.length === 0) {
          return res.status(404).json({ message: 'No data found' });
        }

        res.status(200).send(user)
    }
   

    if (typeof(db) === "string") res.status(200).json({message : 'Find One Route!'});
    
  } catch (err) {
    res.status(500).send({
      message: err.message 
    });
  }
};
  
// UPDATE A USER BY THE ID IN THE REQUEST
exports.update = async (req, res) => {

  try {
    const id = req.params.id;
    const db = await db_connector();

    if(typeof(db) === "function") {
      const result = await updateUserFromPostreSQLdb(req,id,db)
      res.status(200).send({ message: "User was updated successfully!" , data : result});
    }


    if(typeof(db) === "object") {
      const result = await updateUserFromSqldb(req,id,db)
      // console.log(result)
      // IF NO ROWS ARE UPDDATED.
      if (result[0] === 0) {
        return res.status(400).json({ message: "Requested content can't be updated" });
      }

      res.status(200).send({ message: "User was updated successfully!" });
    }

    if (typeof(db) === "string") res.status(200).json({message : 'Update Route!'});

    
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
  
};


// DELETE A USER WITH THE SPECIFIED ID IN THE REQUEST
exports.delete = async (req, res) => {

 try {

     const id = req.params.id;
     const db = await db_connector();

     if(typeof(db) === "function") {
        await deleteUserFromPostgreSQLdb(req,res,id,db)
        res.status(200).send({ message: "User was deleted successfully!" });
     }
     
     if(typeof(db) === "object"){
         await deleteUserFromSqldb(req,res,id,db)
         res.status(200).send({ message: "User was deleted successfully!" });
     }

      if (typeof(db) === "string") res.status(200).json({message : 'Delete Route!'});
   
  } catch (err) {
    
    res.status(500).send({
      message: "Could not delete project with id=" + id
    });
  }
 
};
// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
  try {
    
    const db = await db_connector();

    if(typeof(db) === "function") {

      await deleteAllUserFromPostgreSQLdb(db);

      res.status(200).send({
          message : "All Users has been deleted Successfully!"
      })

    }
    if(typeof(db) === "object") {
        await deleteAllUserFromSqldb(db);
    
        res.status(200).send({
          message : "All Users has been deleted Successfully!"
        })
    }

     if (typeof(db) === "string") res.status(200).json({message : 'Delete All Route!'});
    
  } catch (err) {
    
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Users."
    
    });
  }
  
};


// FIND ALL PUBLISHED USERS
exports.findAllUpdated = async (req, res) => {
  try {
     const db = await db_connector();

     if(typeof(db) === "function") {
        const data = await findAllUpdatedUserFromPostgreSQLdb(db);

        if (!data || Array.isArray(data) && data.length === 0) {
          return res.status(404).json({ message: 'No data found' });
        }

        res.send(data)
     }

   
     if(typeof(db) === "object"){
        const data = await findAllUpdatedUserFromSqldb(db)
        if (!data || Array.isArray(data) && data.length === 0) {
          return res.status(404).json({ message: 'No data found' });
        }

        res.send(data)
     }

     if (typeof(db) === "string") res.status(200).json({message : 'Find All Updated Route!'});
   
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
 
}


//! NOTE : THIS HANDLER IS JUST CRON JOB
exports.updateUserStatusinBulk = async () => {
  try {

    //  if (!req.body) {
    //     return res.status(400).send({ message: "Content can not be empty!" });
    //   }

    //   if (!req.body.subscription) {
    //     return res.status(400).send({ message: "Bad Request!" });
    //   }
     
     const db = await db_connector();

     if(typeof(db) === "function"){
        const result = await updateUserinBulkFromPostgreSqldb(db)
        // if(result)  res.send({message : "All User's has Subscribed Again!"})
        if(result) return "All User's has Subscribed Again!"
     }
   
    //  if(typeof(db) === "object"){
    //     const data = await updateUserinBulkFromSqldb(db)
    //     res.send(data)
    //  }

    //  if (typeof(db) === "string") res.status(200).json({message : 'Update Services bulk Route!'});
  
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
}

