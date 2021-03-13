'use strict'


//Imports
const billController = require('../controllers/bill.controller');
const express = require('express');

//Middleware
const authentication = require('../middlewares/authenticated');

//Rutas
var api = express.Router();

api.get('/createBill', authentication.ensureAuth, billController.createBill);
api.get('/readBillUser', authentication.ensureAuth, billController.readBillUser);
api.get('/readProductsBill', authentication.ensureAuth, billController.readProductsBill);
api.get('/readProductsExhausted', authentication.ensureAuth, billController.readProductsExhausted);
api.get('/readProductsSoldOut', authentication.ensureAuth, billController.readProductsSoldOut);
api.get('/itemizedBill', authentication.ensureAuth, billController.itemizedBill);
api.get('/createBillPDF/:idUser', authentication.ensureAuth, billController.createBillPDF);

module.exports = api;