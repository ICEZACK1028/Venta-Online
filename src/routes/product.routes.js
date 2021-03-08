'use strict'

//Imports
const productController = require('../controllers/product.controller');
const express = require('express');

//Middlewares
const authentication = require('../middlewares/authenticated');

//Routes
var api = express.Router();

api.post('/createProduct/:idCategory', authentication.ensureAuth, productController.createProduct);
api.put('/updateProduct/:idProduct', authentication.ensureAuth, productController.updateProduct);
api.delete('/deleteProduct/:idProduct', authentication.ensureAuth, productController.deleteProduct);
api.get('/getProductId/:idProduct', authentication.ensureAuth, productController.readProductId);
api.get('/getProducts', authentication.ensureAuth, productController.readProducts);

module.exports = api;