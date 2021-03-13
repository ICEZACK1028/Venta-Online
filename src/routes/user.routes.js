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
api.put('/updateRol/:idUser', md_autentication.ensureAuth, userController.updateRol);
api.delete('/deleteUserClient/:idUser', md_autentication.ensureAuth, userController.deleteUserClient);
api.put('/editUserClient/:idUser', md_autentication.ensureAuth,  userController.editUserClient);
api.put('/editUser', md_autentication.ensureAuth,  userController.editUser);
api.delete('/deleteUser', md_autentication.ensureAuth,  userController.deleteUser);
api.get('/searchProductsName', md_autentication.ensureAuth, userController.searchProductsName);
api.get('/searchCategory', md_autentication.ensureAuth, userController.searchCategory);
api.get('/searchProductsCategory', md_autentication.ensureAuth, userController.searchProductsCategory);
api.get('/mostSoldProducts', md_autentication.ensureAuth, userController.mostSoldProducts);

module.exports = api;