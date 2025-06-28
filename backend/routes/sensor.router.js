const express = require('express');
const SensorController = require('../controllers/sensor.controller');

const Router = express.Router();

Router.post("/create",SensorController.create);

Router.get("/find",SensorController.find)

Router.delete("/destroy",SensorController.destroy)

Router.put("/update",SensorController.update)

module.exports = Router