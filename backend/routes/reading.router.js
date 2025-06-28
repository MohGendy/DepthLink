const express = require('express');
const ReadingController = require('../controllers/reading.controller');

const Router = express.Router();

Router.get("/find",ReadingController.find)

Router.delete("/destroy",ReadingController.destroy)

Router.delete("/clear",ReadingController.clear)

module.exports = Router