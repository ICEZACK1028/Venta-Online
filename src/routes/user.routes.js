'use strict'

//Imports
const express = require("express");
const userController = require('../controllers/user.controller');

//Middlewaree
const md_autentication = require('../middlewares/authenticated');

//Routes
var api = express.Router();
api.post('/registryUser', userController.registryUser);
api.post('/login', userController.login);
api.post('/createUser', md_autentication.ensureAuth,  userController.createUser);
api.put('/editUser/:idUser', md_autentication.ensureAuth,  userController.editUser);
api.delete('/deleteUser/:idUser', md_autentication.ensureAuth, userController.deleteUser);

module.exports = api;