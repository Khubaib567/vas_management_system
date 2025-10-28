const db_connector = require("../config/db.config");
const {createUserFromSqldb,getAllUserFromSqldb,getOneUserFromSqldb,updateUserFromSqldb,deleteUserFromSqldb,updateUserinBulkFromSqldb} = require("../controller/user.services/sql.user.operatons")
const {createUserFromPostgreSQLdb , getAllUserFromPostgreSQLdb , getOneUserFromPostgreSQLdb  , updateUserFromPostreSQLdb} = require("../controller/user.services/postgres.user.operatons")
// CREATE AND SAVE A NEW USER
exports.create = async (req, res) => {
  
  try {

    const db = await db_connector();

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

    res.status(200).json({
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        users: usersForPage
    });


  }
  
  if (typeof(db) === "object") {
    const users = await getAllUserFromSqldb(req,db)

    if (!users || users.count === 0) {
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
     const db = await db_connector();

     if(typeof(db) === "function") res.status(200).json({message : 'Delete Route!'});
     
     if(typeof(db) === "object"){
         await deleteUserFromSqldb(req,res,id,db)
         res.status(200).send({ message: "Project was deleted successfully!" });
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

    if(typeof(db) === "function") res.status(200).json({message : 'Delete All Route!'});


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

     if(typeof(db) === "function") res.status(200).json({message : 'Find All Updated Route!'});

   
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

exports.updateUserStatusinBulk = async (req,res) => {
  try {

     if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
      }

      if (!req.body.subscription) {
        return res.status(400).send({ message: "Bad Request!" });
      }
     
     const db = await db_connector();
   
     if(typeof(db) === "object"){
        const data = await updateUserinBulkFromSqldb(req,db)
        res.send(data)
     }

     if (typeof(db) === "string") res.status(200).json({message : 'Update Services bulk Route!'});
  
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
}

