'use strict'

//Imports
const cartController = require('../controllers/cart.controller');
const express = require('express');

//Middlewares
const authentication = require('../middlewares/authenticated');

//Routes
var api = express.Router();

api.put('/addProduct', authentication.ensureAuth, cartController.agregateProduct);

module.exports = api;