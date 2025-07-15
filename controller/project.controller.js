const db = require("../config/db.config");
const Project = db.projects;
const User = db.users;
const Op = db.Sequelize.Op;
// Create and Save a new User
exports.create = async (req, res) => {
    // Check the body of the request is null or not
    const {project_title , project_created_by , updated } = req.body
    try {
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
  
      res.send(newProject);
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Project.",
      });
    }

}
  
// Retrieve all projects from the database.
exports.findAll = async (req, res) => {
  try {
    const project_title = req.query.project_title;
    const condition = project_title ? { project_title: { [Op.like]: `%${project_title}%` } } : null;

    const data = await Project.findAll({ where: condition });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
};

// Find a single project with a project_id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Project.findByPk(id);

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Project with project_id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Project with project_id=" + id
    });
  }
  
};

// Update a User by the user_id in the request
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const num = await Project.update(req.body, { where: { id: id } });

    if (num == 1) {
      res.send({ message: "Project was updated successfully." });
    } else {
      res.send({
        message: `Cannot update Project with id=${id}. Maybe project was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating project with id=" + id
    });
  }
  
};

// Delete a User with the specified user_id in the request
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const num = await Project.destroy({ where: { id: id } });

    if (num === 1) {
      res.send({ message: "Project was deleted successfully!" });
    } else {
      res.send({
        message: `Cannot delete project with id=${id}. Maybe project was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete project with id=" + id
    });
  }
};

// Delete all Users from the database.
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Project.destroy({ where: {}, truncate: false });
    res.send({ message: `${nums} Projects were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Projects."
    });
  }
  
};

// Find all published Projects
exports.findAllUpdated = async (req, res) => {
  try {
    const data = await Project.findAll({ where: { updated: true } });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
};