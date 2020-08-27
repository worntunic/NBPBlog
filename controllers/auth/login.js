/**
 * Created by Backend on 4/10/17.
 */

"use strict";

const User                      = require('../../schemas/User');

const jwtCtrl                   = require('./jwt');

const crypto                    = require('crypto');

exports.handleLogInAdmin        = handleLogInAdmin;

exports.handleLogInUser         = handleLogInUser;

exports.login                   = (req, res) => {
    userLogIn(req.body, (err, user_info) => {
        if (err) return res.status(err.status || 500).json(err);

        switch (user_info.role) {
            case 'Admin':
                handleLogInAdmin(user_info, (err, tokens) => {
                    if (err) return res.status(err.status || 500).json(err);

                    res.header('jwt_access', tokens.access);
                    res.header('jwt_refresh', tokens.refresh);
                    res.status(200).json({success: true, jwt_access: tokens.access, jwt_refresh: tokens.refresh, role: 'Admin'})
                });
                break;
            case 'User':
                handleLogInUser(user_info, (err, tokens) => {
                    if (err) return res.status(err.status || 500).json(err);

                    res.header('jwt_access', tokens.access);
                    res.header('jwt_refresh', tokens.refresh);
                    res.status(200).json({success: true, jwt_access: tokens.access, jwt_refresh: tokens.refresh, role: 'User'})
                });
                break;
            default:
                res.status(200).json({success: false})
        }
    })
};


function userLogIn (obj, callback) {
    let error = null;

    if (!callback       || typeof callback !== 'function') throw new Error('Callback required');

    if (!obj            || typeof obj           !== 'object' ||
        !obj.username   || typeof obj.username  !== 'string' ||
        !obj.password   || typeof obj.password  !== 'string') {

        error           = new Error();
        error.status    = 400;
        error.message   = 'Invalid Object. Fill all fields and check your data types';

        return callback(error)
    }

    User.findOne({$or: [{username: obj.username.toLowerCase()}, {email: obj.username.toLowerCase()}]}, (err, user) => {
        if (err) return callback(err);

        if (!user) {
            error           = {};
            error.status    = 202;
            error.message   = 'Invalid username or password.';
            error.success   = false;

            return callback(error)
        }

        let check_pass = crypto.pbkdf2Sync(obj.password, user.salt, 10000, 512, 'sha512');

        if (check_pass.toString() !== user.hashedPassword) {
            error           = {};
            error.status    = 202;
            error.message   = 'Invalid username or password.';
            error.success   = false;

            return callback(error)
        }

        let user_info = {
            _id             : user._id.toString(),
            role            : user.role,
            username        : user.username
        };

        callback (null, user_info)
    })
}

function handleLogInAdmin (obj, callback) {
    let error = null;

    if (!callback       || typeof callback !== 'function') throw new Error('Callback required');

    callback(null, jwtCtrl.createTokens(obj));
}

function handleLogInUser (obj, callback) {
    let error = null;

    if (!callback       || typeof callback !== 'function') throw new Error('Callback required');

    callback(null, jwtCtrl.createTokens(obj));
}
