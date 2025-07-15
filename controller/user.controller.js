const db = require("../config/db.config");
const {generateToken,removeToken} = require('../utils/json.token');
const User = db.users;
const Project = db.projects;
const Op = db.Sequelize.Op;

// CREATE AND SAVE A NEW USER
exports.create = async (req, res) => {
  // USE OBJECT DESTRUCTION FOR EASILY ACCESS REQ BODY PARAMETER.
  const {name , password , email  } = req.body;
  
  try {
    if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
    
    // CREATE A USER OBJECT
    const obj = {
      name: name,
      password: password,
      email: email
    };


    // SAVE USER IN THE DATABASE
    const data = await User.create(obj);

    // FETCH THE NEWLY CREATED USER USING FINDONE
    const user = await User.findOne({ where: { id: data.id } });
    if (!user) {
       return res.status(404).json({ message: "User not found after creation" });
    }

    // GENERATE TOKEN 
    const token = await generateToken(res, user.id);
    // UPDATE THE USER WITH INSERT THE TOKEN
    const user_with_jwt = await user.update({ token });
    res.send({ user_with_jwt });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};

// RETRIEVE ALL USERS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll({ include: ["projects"] });
    await res.send(users);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
  
};

// FIND A SINGLE USER WITH AN ID
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id, { include: ["projects"] });
    if(user){
     await res.send(user)
    }
     else {
      res.status(404).send({
        message: `Cannot find User with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving User with id=" + id
    });
  }
};
  
// UPDATE A USER BY THE ID IN THE REQUEST
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [num] = await User.update(req.body, { where: { id: id } });
    // HERE UPDATE RESULT GIVE TWO VALUES: 
    // 0 MEANS NOT UPDATED THE OBJECT BODY.
    // 1 MEANS UPDATED THE OBJECT BODY.
    
    if (num === 1) {
      res.send({ message: "User was updated successfully." });
    } else {
      res.send({
        message: `Cannot update User with id=${id}. Maybe user was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating user with id=" + id
    });
  }
  
};
// DELETE A USER WITH THE SPECIFIED ID IN THE REQUEST
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const num = await User.destroy({ where: { id: id } });

    await removeToken(req, res);

    if (num === 1) {
      res.send({ message: "User was deleted successfully!" });
    } else {
      res.send({
        message: `Cannot delete user with id=${id}. Maybe User was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete user with id=" + id
    });
  }
 
};
// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
  try {
    const nums = await User.destroy({ where: {}, truncate: false });
    res.send({ message: "All Users were deleted successfully!"});
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Users."
    });
  }
  
};
// FIND ALL PUBLISHED USERS
exports.findAllUpdated = async (req, res) => {
  try {
    const data = await User.findAll({ where: { updated: true } });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
}
