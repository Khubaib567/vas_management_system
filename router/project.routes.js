
module.exports = app => {
    const projects = require("../controller/project.controller.js");
    var router = require("express").Router();
    // Create a new User
    router.post("/", projects.create);
    // Retrieve all projects
    router.get("/", projects.findAll);
    // Retrieve all published projects
    router.get("/updated", projects.findAllUpdated);
    // Retrieve a single User with project_title
    router.get("/:id", projects.findOne);
    // Update a User with id
    router.put("/:id", projects.update);
    // Delete a User with id
    router.delete("/:id", projects.delete);
    // Delete all projects
    router.delete("/", projects.deleteAll);
    app.use('/api/project', router);
   
};