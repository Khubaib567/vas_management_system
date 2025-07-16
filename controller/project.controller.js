const db = require("../config/db.config");
const Project = db.projects;
const User = db.users;
const Op = db.Sequelize.Op;

// CREATE USER
exports.create = async (req, res) => {
   
    const {project_title , project_created_by , updated } = req.body
    try {
      // CHECK THE BODY OF REQ. IS NULL OR NOT
      
      if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
      }
  
      // CREATE A PROJECT OBJECT.
      const project = {
        project_title: project_title,
        project_created_by: project_created_by,
        updated: updated ? updated : false
      };
  
      // FETCH USER WITH PROJECT ARRIBUTE.
      const users = await User.findAll({ include: ["projects"] });
  
      const user = users.find((obj) => obj.name === project.project_created_by);
      console.log(user)

      // CREATE A PROJECT INSTANCE.
      const newProject = await Project.create(project);
      
       // SET THE PROJECT INSTANCE WITH FOREIGN KEY BASED ON USER'ID
      if (user) {
        await user.setProjects(newProject);
      }
      
      
     
      // UPDATE THE USER RECORD 
      // const updatedUser = await User.update(updated, { where: { id: user.id } });
      // if(updatedUser ===1){
      //  console.log({ message: "User was updated successfully." });
      // }else {
      //   console.log({
      //     message: `Cannot update User with id=${user.id}. Maybe user was not found or req.body is empty!`
      //   });
      // }
      
     
  
      res.status(200).send(newProject);
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Project.",
      });
    }

}
  
// RETRIEVE ALL PROJECTS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  try {
    const project_title = req.query.project_title;
    
    const condition = project_title ? { project_title: { [Op.like]: `%${project_title}%` } } : null;

    const data = await Project.findAll({ where: condition });

    if (!data || (Array.isArray(data) && data.length === 0)) {
     return res.status(404).json({ message: 'No data found' });
     }

    res.status(200).send(data)

  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
};

// FIND A SINGLE PROJECT WITH A PROJECT_ID.
exports.findOne = async (req, res) => {
  const id = req.params.id;
  
  try {
    
    const data = await Project.findByPk(id);

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

    const result = await Project.update(req.body, { where: { id: id } });
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
    
    await Project.destroy({ where: { id: id } });
    
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
    
    await Project.destroy({ where: {}, truncate: false });
    
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
  const data = await Project.findAll({ where: { updated: true } });

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