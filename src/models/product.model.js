'use strict'

//Imports  
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = Schema({
    name: String,
    stock: Number,
    price: Number,
    categoryId: {type: Schema.Types.ObjectId, ref: 'categorys'},
    soldOut: Number
});

//Export
module.exports = mongoose.model('products', ProductSchema);