"use strict";

const User = require('./User');
const Comment = require('./Comment');

const mongoose = require('mongoose');
const connection = require('./connection');

let PostSchema = new mongoose.Schema({
    title : {
        type        : String
    },
    content         : {
        type        : String
    },
    date_created      : {
        type        : Date
    },
    _user  : {
        type        : mongoose.Schema.ObjectId,
        ref         : 'User'
    },
    _comments: [{
        type        : mongoose.Schema.ObjectId,
        ref         : 'Comment'
    }]
});


module.exports = connection.model('Post', PostSchema);
