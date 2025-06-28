const express = require('express');
const path = require('path');
const frontController = require('../controllers/front.controller');
const Router = express.Router();

Router.use("/assets",express.static(path.join(__dirname,"../../frontend/assets")))

Router.get("/login",frontController.loginPage)

Router.post("/login",frontController.login)


Router.get("/",frontController.home)

Router.use(frontController.auth)

Router.get("/dashboard",frontController.dashboard)

Router.get("/readings",frontController.readings)

Router.get("/sensors",frontController.sensors)


module.exports = Router