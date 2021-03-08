'use strict'

//Global var
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

//Routes imports
const user_routes = require('./src/routes/user.routes.js');
const category_routes = require('./src/routes/category.routes');
const product_routes = require('./src/routes/product.routes');

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Headboard
app.use(cors());

//Carga de rutas
app.use('/api', user_routes, category_routes, product_routes);

//Exports
module.exports = app;