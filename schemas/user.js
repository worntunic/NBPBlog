"use strict";

const mongoose = require('mongoose');
const connection = require('./connection');

const crypto = require('crypto');


const Post = require('./Post');
const Comment = require('./Comment');

// Define our user schema
let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    _post: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }],
    _comments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
    email: {type: String, trim: true, unique: true, required: true},
    role: {type: String, enum:['Admin', 'User'], default: 'User'},
    token: {type: String, unique: true}
});

// Execute before each user.save() call
UserSchema.methods.encryptPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512');
};

UserSchema.virtual('userId')
    .get(function () {
        return this._id;
    });

UserSchema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });


UserSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

UserSchema.methods.validatePassword = function(password) {
    let hash1 = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hashedPassword === hash1;
};

UserSchema.pre('save', function(next) {
    if (!this.token) {
        this.token = Date.now() + crypto.randomBytes(16).toString('hex')
    }
    next()
});


// Export the Mongoose model
module.exports = connection.model('User', UserSchema);

