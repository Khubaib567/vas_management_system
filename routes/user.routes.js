const users = require("../controller/user.controller.js");
// APPLY AUTHENTICATION AS MIDDLEWARE
const {auth} = require("../utils/auth.config.js")
// APPLY AUTHORIZATION AS MIDDLEWARE
const {authRole} = require("../utils/auth.config.js");
// CONFIG GRAPHQL FOR BETTER RESPONSE RESULTS
// const { graphqlHTTP } = require('express-graphql');

let router = require("express").Router();


module.exports = app => {
    // CREATE A NEW USER
    router.post("/", users.create);
    // APPLY MIDDLEWARES EXCEPT FIRST ROUTE 
    router.use(auth())
    // GET A USER BASED ON MSSIDN
    router.get("/getuser" , users.findUser)
    // SET OTP BASED ON MSISDN
    router.put("/setotp" , users.setOTP)
    // APPLY MIDDLEWARES EXCEPT FIRST ROUTE 
    router.use(auth() , authRole())
    // RETRIEVE ALL USERS
    router.get("/" , users.findAll);
    // RETRIEVE ALL PUBLISHED USERS'S PROJECTS
    router.get("/updated" , users.findAllUpdated);
    // RETRIEVE SERVICES WITH BULK SUBSCRIPTION
    router.put("/bulk", users.updateUserStatusinBulk);
    // RETRIEVE A SINGLE USER WITH ID
    router.get("/:id", users.findOne);
    // UPDATE A USER WITH ID
    router.put("/:id", users.update);
    // DELETE A USER WITH ID
    router.delete("/:id", users.delete);
    // DELETE ALL users
    router.delete("/", users.deleteAll);
    app.use('/api/user' , router);
};