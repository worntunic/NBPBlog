"use strict";

const User = require('../schemas/User');

const validator = require('validator');
const crypto = require('crypto');

exports.signUp = (req, res) => {
    sign_up(req, res);
};

function sign_up(req, res) {
    if (req && req.body && req.body.username && req.body.password && req.body.email && req.body.username !== "" && req.body.password !== "" && req.body.email !== "") {
        let userEmail = req.body.email.toLowerCase();
        let userUsername = req.body.username.toLowerCase();

        if (validator.isEmail(userEmail)) {
            User.findOne({$or: [{email: userEmail}, {username: userUsername}]}, (err, userExist) => {
                if (err) {
                    res.status(500).json(err);
                }
                else if (!userExist) {
                    let user = new User();
                    user.username = userUsername;
                    user.password = req.body.password;
                    user.email = userEmail;
                    user.role = req.body.role ? req.body.role : 'User';
                    user.token = crypto.randomBytes(32).toString('hex');

                    user.save((err) => {
                        if (err) {
                            res.status(500).json(err);
                        }
                        else {
                            user.save((err) => {
                                if (err) {
                                    res.status(500).json(err);
                                }
                                else {
                                    res.status(201).json({message: 'Sign up successful. New user added.', _id: user._id, role: user.role, username: user.username});
                                }
                            });
                        }
                    })
                }
                else {
                    User.findOne({username: userUsername}, (err, existingUser) => {
                        if (err) {
                            res.status(500).json(err);
                        }
                        else if (!existingUser) {
                            res.status(202).json({message: "Email already registered"});
                        }
                        else {
                            res.status(202).json({message: "Username already registered"});
                        }
                    });
                }
            })
        }
        else {
            res.status(400).json({message: 'Invalid email format'})
        }
    }
    else {
        res.status(400).json({message: "Please fill all fields"})
    }
}
