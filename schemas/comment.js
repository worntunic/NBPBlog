"use strict";

const User = require('./User');
const Post = require('./Post');

const mongoose = require('mongoose');
const connection = require('./connection');

let CommentSchema = new mongoose.Schema({
    comment         : {
        type        : String
    },
    date_created    : {
        type        : Date
    },
    _user           : {
        type        : mongoose.Schema.ObjectId,
        ref         : 'User'
    },
    _post           : {
        type        : mongoose.Schema.ObjectId,
        ref         : 'Post'
    }
});


module.exports = connection.model('Comment', CommentSchema);
