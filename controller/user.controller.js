const db = require("../config/db.config");
const {generateToken,removeToken} = require('../utils/json.token');
const User = db.users;


// CREATE AND SAVE A NEW USER
exports.create = async (req, res) => {
  // USE OBJECT DESTRUCTION FOR EASILY ACCESS REQ BODY PARAMETER.
  const {name , password , email , role , updated } = req.body;
  
  try {
    if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
    
    // CREATE A USER OBJECT
    const obj = {
      name: name,
      password: password,
      email: email,
      role : role ? role : "STUDENT" ,
      updated : updated ? updated : false
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
    res.send({ result });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};

// RETRIEVE ALL USERS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  const data = await User.findAll({ include: ["projects"] });

  try {
    
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

// FIND A SINGLE USER WITH AN ID
exports.findOne = async (req, res) => {
  
  const id = req.params.id;
  
  try {

    const data = await User.findByPk(id, { include: ["projects"] });
    
    if (!data || Array.isArray(data) && data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).send(data)

  } catch (err) {
    res.status(500).send({
      message: "Error retrieving User with id=" + id
    });
  }
};
  
// UPDATE A USER BY THE ID IN THE REQUEST
exports.update = async (req, res) => {

  const id = req.params.id;

  try {
    
    const result = await User.update(req.body, { where: { id: id } });
    
    // IF NO ROWS ARE UPDDATED.
    if (result[0] === 0) {
      return res.status(400).json({ message: "Requested content can't be updated" });
    }
    
    res.status(200).send({ message: "User was updated successfully!" });
    
  } catch (err) {
    res.status(500).send({
      message: "Error updating user with id=" + id
    });
  }
  
};
// DELETE A USER WITH THE SPECIFIED ID IN THE REQUEST
exports.delete = async (req, res) => {

  const id = req.params.id;

  try {
    await User.destroy({ where: { id: id } });

    await removeToken(req, res);

    res.status(200).send({ message: "User was deleted successfully!" });
    }
  catch (err) {
    
    res.status(500).send({
      message: "Could not delete user with id=" + id
    
    });
  }
 
};
// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
  try {
    await User.destroy({ where: {}, truncate: false });
    
    res.status(200).send({
      message : "All Projects has been deleted Successfully!"
    
    })
  } catch (err) {
    
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Users."
    
    });
  }
  
};
// FIND ALL PUBLISHED USERS
exports.findAllUpdated = async (req, res) => {
  
  const data = await User.findAll({ where: { updated: true } });

  try {
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.send(data);

  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
}
