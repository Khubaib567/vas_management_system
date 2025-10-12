const services = require("../controller/service.controller.js");
let router = require("express").Router();

// APPLY AUTHENTICATION AS MIDDLEWARE
const {auth} = require("../utils/auth.config.js")
// APPLY AUTHORIZATION AS MIDDLEWARE
const {authRole} = require("../utils/auth.config.js");

module.exports = app => {
    // APPLY AUTHENTICATION & ATHORIZATION TO ALL ROUTES
    router.use(auth() , authRole())
    // CREATE A NEW PROJECT
    router.post("/", services.create);
    // RETRIEVE ALL services
    router.get("/", services.findAll);
    // RETRIEVE ALL PUBLISHED services
    router.get("/updated", services.findAllUpdated);
    // RETRIEVE SERVICES WITH BULK SUBSCRIPTION
    router.put("/bulk", services.updateServiceinBulk);
    // RETRIEVE A SINGLE USER WITH PROJECT_TITLE
    router.get("/:id", services.findOne);
    // UPDATE A USER WITH ID
    router.put("/:id", services.update);
    // DELETE A USER WITH ID
    router.delete("/:id", services.delete);
    // DELETE ALL services
    router.delete("/", services.deleteAll);
    app.use('/api/services', router);
   
};