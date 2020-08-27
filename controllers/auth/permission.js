"use strict";

const jwt                       = require('jsonwebtoken');
const fs                        = require('fs');

exports.adminPermissions = (role) => {
    if (!role || typeof role !== 'string') {
        console.warn('No permissions added in middleware')
    }

    return (req, res, next) => {

        if (!role || typeof role !== 'string') {
            return res.status(403).send('Forbidden')
        }

        let decoded_access = jwt.decode(req.headers.jwt_access);

        if (decoded_access.role === 'Admin') {
            return next()
        }

        return res.status(403).send('Forbidden')
    }
};
