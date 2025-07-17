const projects = require("../controller/project.controller.js");
let router = require("express").Router();

// APPLY AUTHENTICATION AS MIDDLEWARE
const {auth} = require("../utils/auth.config.js")
// APPLY AUTHORIZATION AS MIDDLEWARE
const {authRole} = require("../utils/auth.config.js");

module.exports = app => {
    // APPLY AUTHENTICATION & ATHORIZATION TO ALL ROUTES
    router.use(auth() , authRole())
    // CREATE A NEW PROJECT
    router.post("/", projects.create);
    // RETRIEVE ALL PROJECTS
    router.get("/", projects.findAll);
    // RETRIEVE ALL PUBLISHED PROJECTS
    router.get("/updated", projects.findAllUpdated);
    // RETRIEVE A SINGLE USER WITH PROJECT_TITLE
    router.get("/:id", projects.findOne);
    // UPDATE A USER WITH ID
    router.put("/:id", projects.update);
    // DELETE A USER WITH ID
    router.delete("/:id", projects.delete);
    // DELETE ALL PROJECTS
    router.delete("/", projects.deleteAll);
    app.use('/api/project', router);
   
};