const db = require("../config/db.config");
const Service = db.services;
const User = db.users;
const Op = db.Sequelize.Op;

// CREATE USER
exports.create = async (req, res) => {
   
    const {service , subscriber , subscribe } = req.body
    try {
      // CHECK THE BODY OF REQ. IS NULL OR NOT
      
      if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
      }
  
      // CREATE A PROJECT OBJECT.
      const serviceObj = {
        service: service,
        subscriber: subscriber,
        subscribe: subscribe ? subscribe : false
      };
      // console.log(serviceObj.subscriber)
  
      // FETCH USER WITH PROJECT ARRIBUTE.
      const users = await User.findAll({ include: Service });
  
      const user = users.find((obj) => obj.name === serviceObj.subscriber);
      // console.log(user)

      // UPDATE THE USER UPDATE ATTRIBUTE 
      const result = await User.update({ subscribe: serviceObj.subscribe }, { where: { id: user.id } });
      if(result) console.log("User 'Serice' column has been updated!")

      // CREATE A PROJECT INSTANCE.
      const updatedService = await Service.create(serviceObj);
      // console.log(updatedService)
      
       // SET THE PROJECT INSTANCE WITH FOREIGN KEY BASED ON USER'ID
      if (user) {
        await user.setServices(updatedService);
      }
  
      res.status(200).send(updatedService);
      
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Project.",
      });
    }

}
  
// RETRIEVE ALL PROJECTS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  const { service, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const condition = service
    ? { service: { [Op.like]: `%${service}%` } }
    : {};
  
  try {

  const data = await Project.findAndCountAll({
    where: condition,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  if (!data || data.count === 0) {
    return res.status(404).json({ message: 'No data found' });
  }

  res.status(200).json({
    totalItems: data.count,
    totalPages: Math.ceil(data.count / limit),
    currentPage: parseInt(page),
    projects: data.rows
  });

} catch (err) {
  res.status(500).json({
    message: err.message || "Some error occurred while retrieving Projects."
  });
};
}

// FIND A SINGLE PROJECT WITH A PROJECT_ID.
exports.findOne = async (req, res) => {
  const id = req.params.id;
  
  try {
    
    const data = await Service.findByPk(id , { include : User });

    if (!data || Array.isArray(data) && data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).send(data)
    
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Project with project_id=" + id
    });
  }
  
};

// UPDATE A USER BY THE USER_ID IN THE REQUEST.
exports.update = async (req, res) => {

  const id = req.params.id;
  
  try {

    const result = await Service.update(req.body, { where: { id: id } });
    console.log(result)

    // IF NO ROWS ARE UPDDATED.
    if (result[0] === 0) {
      return res.status(400).json({ message: "Requested content can't be updated" });
    }

    res.status(200).send({ message: "Project was updated successfully!" });
    
  } catch (err) {
    res.status(500).send({
      message: "Error updating project with id=" + id
    });
  }
  
};

// DELETE A USER WITH THE SPECIFIED USER_ID IN THE REQUEST
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    
    await Service.destroy({ where: { id: id } });
    
    res.status(200).send({ message: "Project was deleted successfully!" });
  } catch (err) {
    
    res.status(500).send({
      message: "Could not delete project with id=" + id
    });
  }
};

// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
  try {
    
    await Service.destroy({ where: {}, truncate: false });
    
    res.status(200).send({
      message : "All Projects has been deleted Successfully!"
    })
  } catch (err) {
    
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Projects."
    
    });
  }
  
};

// FIND ALL PUBLISHED PROJECTS
exports.findAllUpdated = async (req, res) => {
  const data = await Service.findAll({ where: { subscribe: true } });

  try {
     
    if (!data || Array.isArray(data) && data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }
    
    res.send(data)
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
};