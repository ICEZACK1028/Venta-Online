'use strict'

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('categorys', CategorySchema );