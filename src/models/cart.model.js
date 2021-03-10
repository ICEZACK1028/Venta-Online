'use strict'

//Imports 
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartSchema = Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'users'},
    productsBt:[{
        idProduct : {type: Schema.Types.ObjectId, ref: 'products'},
        amount: Number,
        subtotal: Number
    }],
    total: Number
});  

module.exports = mongoose.model('carts', cartSchema);