"use strict";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mongoURI = 'mongodb://127.0.0.1:27017/blog_app';

let connection = module.exports = mongoose.createConnection(mongoURI);

connection.on('connected', function(){
    console.log('mongoose connected to connProduction');
});
