const db_connector = require("../config/db.config");
const {createServiceFromSqldb,getAllSerivceFromSqldb , getOneServiceFromSqldb , updateServiceFromSqldb , deleteServiceFromSqldb , deleteAllServiceFromSqldb , findAllUpdatedServiceFromSqldb , updateServiceinBulkFromSqldb} = require("../utils/sql.service.operations")

// CREATE USER
exports.create = async (req, res) => {
   
    
    try {
      const db = await db_connector();
      if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
      }
  
      if(typeof(db) === "object") {

      // CHECK THE BODY OF REQ. IS NULL OR NOT
      const service = await createServiceFromSqldb(req , db)
      res.status(200).send(service);
      }

      if (typeof(db) === "string") res.status(200).json({message : 'Create Route!'});
      
      
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Project.",
      });
    }

}
  
// RETRIEVE ALL PROJECTS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  
      try {

        const db = await db_connector();
        // console.log(typeof(db) === String)
        if (typeof(db) === "object") {
          const services = await getAllSerivceFromSqldb(req,db)

          if (!services || services.count === 0) {
          return res.status(404).json({ message: 'No data found' });
          }

          res.status(200).json({
            totalItems: services.count,
            totalPages: Math.ceil(services.count / limit),
            currentPage: parseInt(page),
            services: services.rows
          });
        }

        if (typeof(db) === "string") res.status(200).json({message : 'Find All Route!'});

        
        
      } catch (error) {
         res.status(500).json({
          message: err.message || "Some error occurred while retrieving Projects."
        });
      }
}

// FIND A SINGLE PROJECT WITH A PROJECT_ID.
exports.findOne = async (req, res) => {
  
  try {
    const id = req.params.id;
    const db = await db_connector();

    if(typeof(db) === "object") {
         const service = await getOneServiceFromSqldb(id,db);
        if (!service || Array.isArray(data) && data.length === 0) {
          return res.status(404).json({ message: 'No data found' });
        }

        res.status(200).send(service)
    }
   

    if (typeof(db) === "string") res.status(200).json({message : 'Find One Route!'});
    
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Project with project_id=" + id
    });
  }
  
};

// UPDATE A USER BY THE USER_ID IN THE REQUEST.
exports.update = async (req, res) => {

  
  try {
    const id = req.params.id;
    const db = await db_connector();
    if(typeof(db) === "object") {
      const result = await updateServiceFromSqldb(req,id,db)
      // console.log(result)
      // IF NO ROWS ARE UPDDATED.
      if (result[0] === 0) {
        return res.status(400).json({ message: "Requested content can't be updated" });
      }

      res.status(200).send({ message: "Service was updated successfully!" });
    }

    if (typeof(db) === "string") res.status(200).json({message : 'Update Route!'});

    
  } catch (err) {
    res.status(500).send({
      message: "Error updating project with id=" + id
    });
  }
  
};

// DELETE A USER WITH THE SPECIFIED USER_ID IN THE REQUEST
exports.delete = async (req, res) => {

  try {
      const id = req.params.id;
     const db = await db_connector();
     if(typeof(db) === "object"){
         await deleteServiceFromSqldb(id,db)
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

    if(typeof(db) === "object") {
        await deleteAllServiceFromSqldb(db);
    
        res.status(200).send({
          message : "All Projects has been deleted Successfully!"
        })
    }

     if (typeof(db) === "string") res.status(200).json({message : 'Delete All Route!'});
    
  } catch (err) {
    
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Projects."
    
    });
  }
  
};

// FIND ALL PUBLISHED PROJECTS
exports.findAllUpdated = async (req, res) => {
 
  try {
     const db = await db_connector();
   
     if(typeof(db) === "object"){
        const data = await findAllUpdatedServiceFromSqldb(db)
        if (!data || Array.isArray(data) && data.length === 0) {
          return res.status(404).json({ message: 'No data found' });
        }

        res.send(data)
     }

     if (typeof(db) === "string") res.status(200).json({message : 'Find All Updated Route!'});
   
    
    
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
};


exports.updateServiceinBulk = async (req,res) => {
  try {

     if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
      }

      if (!req.body.subscription) {
        return res.status(400).send({ message: "Bad Request!" });
      }
     
     const db = await db_connector();
   
     if(typeof(db) === "object"){
        const data = await updateServiceinBulkFromSqldb(req,db)
        res.send(data)
     }

     if (typeof(db) === "string") res.status(200).json({message : 'Update Services bulk Route!'});
  
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
}
