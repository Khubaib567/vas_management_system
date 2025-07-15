module.exports = app => {
    const users = require("../controller/user.controller.js");
    // APPLY AUTHENTICATION AS MIDDLEWARE
    const {auth} = require("../utils/auth.config.js")
    // APPLY AUTHORIZATION AS MIDDLEWARE
    const {authRole} = require("../utils/auth.config.js");
    // CONFIG GRAPHQL FOR BETTER RESPONSE RESULTS
    // const { graphqlHTTP } = require('express-graphql');

    var router = require("express").Router();

    // CREATE A NEW USER
    router.post("/", users.create);
    // APPLY MIDDLEWARES EXCEPT FIRST ROUTE 
    router.all('/', auth() , authRole())
    // RETRIEVE ALL USERS
    router.get("/" , users.findAll);
    // RETRIEVE ALL PUBLISHED USERS
    router.get("/updated" , users.findAllUpdated);
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