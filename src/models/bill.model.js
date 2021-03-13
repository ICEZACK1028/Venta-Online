'use strict'

//Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var billSchema = Schema({
    userIdBill: {type: Schema.Types.ObjectId, ref: 'users'},
    productsBtBill:[{
        idProduct : {type: Schema.Types.ObjectId, ref: 'products'},
        amount: Number,
        price: Number,
        subTotal: Number
    }],
    totalBill: Number
});

module.exports = mongoose.model('bills', billSchema);