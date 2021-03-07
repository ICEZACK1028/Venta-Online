'use strict'

//imports 
const categoryController = require('../controllers/category.controller');
const express = require('express');

//middlewares
const authentication = require('../middlewares/authenticated');

//Routes
var api = express.Router();

api.post('/createCategory', authentication.ensureAuth, categoryController.createCategory);
api.get('/listCategory', authentication.ensureAuth, categoryController.listCategorys);
api.put('/editCategory/:idCategory', authentication.ensureAuth, categoryController.editCategory);
api.delete('/deleteCategory/:idCategory', authentication.ensureAuth, categoryController.deleteCategory);

module.exports = api;