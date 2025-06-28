const express = require('express');
const EspController = require('../controllers/esp.controller');

const Router = express.Router();

Router.post('/reading',EspController.insert)

module.exports = Router