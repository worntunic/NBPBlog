/**
 * Created by Backend on 11/30/16.
 */
"use strict";

const jwt                       = require('jsonwebtoken');
const fs                        = require('fs');

const certPrivate               = fs.readFileSync('controllers/auth/RSAkeys/private.key');
const certPublic                = fs.readFileSync('controllers/auth/RSAkeys/public.pem');


exports.createTokens = createTokens;

exports.logout = (req, res) => {
    if (req.headers.jwt_refresh) {
        let decoded = jwt.decode(req.headers.jwt_refresh);
        let jwt_refresh = jwt.sign({_id: decoded._id, last_pw_change: decoded.last_pw_change, is_valid: false}, certPrivate, {algorithm: 'RS512'});
        res.header('jwt_refresh', jwt_refresh);
    }
    res.status(200).json({success: true});
};

exports.verify = (req, res) => {
    jwt.verify(req.headers.jwt_refresh, certPublic, (err, decoded) => {
        if (decoded && decoded.is_valid) {
            decoded = jwt.decode(req.headers.jwt_access);
            return res.status(200).json(decoded)
        }
        res.status(401).json({message: 'Invalid token'})
    })
};

exports.verifyAdmin = (req, res) => {
    jwt.verify(req.headers.jwt_refresh, certPublic, (err, decoded) => {
        if (decoded && decoded.is_valid) {
            res.status(200).json(decoded);
            return
        }
        res.status(401).json({message: 'Invalid token'})
    })
};

function createTokens (obj) {
    return {
        access  : jwt.sign(createJWTaccess(obj), certPrivate, {algorithm: 'RS512'}),
        refresh : jwt.sign(createJWTrefresh(obj, obj.last_pw_change, true), certPrivate, {algorithm: 'RS512'})
    }
}

function createJWTaccess (obj) {
    obj.exp = Math.floor((Date.now() / 1000) + (60 * 10));
    return obj
}

function createJWTrefresh (_id, last_pw_change, valid) {
    let is_valid;
    if (valid) is_valid = true;
    return {
        _id: _id,
        is_valid: is_valid,
        last_pw_change: last_pw_change,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
    }
}
