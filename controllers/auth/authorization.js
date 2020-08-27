"use strict";

const jwt                       = require('jsonwebtoken');
const fs                        = require('fs');

const loginCtrl                 = require('./login');

const certPrivate               = fs.readFileSync('controllers/auth/RSAkeys/private.key');
const certPublic                = fs.readFileSync('controllers/auth/RSAkeys/public.pem');

const USER_TYPE = {
    USER            : 'User',
    ADMIN           : 'Admin'
};

exports.authorization = (req, res, next) => {
    authorization(req.headers, (err, user_info) => {
        if (err) return res.status(err.status).json(err);

        req.headers._id             = user_info._id;
        req.headers.role            = user_info.role;

        switch (user_info.role) {
            case USER_TYPE.USER:
                loginCtrl.handleLogInUser(user_info, (err, tokens) => {
                    if (err) return res.status(err.status || 500).json(err);

                    res.header('jwt_access', tokens.access);
                    res.header('jwt_refresh', tokens.refresh);
                    next()
                });
                break;
            case USER_TYPE.ADMIN:
                loginCtrl.handleLogInAdmin(user_info, (err, tokens) => {
                    if (err) return res.status(err.status || 500).json(err);

                    res.header('jwt_access', tokens.access);
                    res.header('jwt_refresh', tokens.refresh);
                    next()
                });
                break;
            default:
                let error       = new Error();
                error.status    = 401;
                error.message   = 'Unauthorized';

                res.status(error.status).json(error)
        }
    })
};

function authorization (obj, callback) {
    let error = null;

    if (!callback       || typeof callback !== 'function') throw new Error('Callback required');

    if (!obj                || typeof obj               !== 'object' ||
        !obj.jwt_access     || typeof obj.jwt_access    !== 'string' ||
        !obj.jwt_refresh    || typeof obj.jwt_refresh   !== 'string') {

        error           = new Error();
        error.status    = 401;
        error.message   = 'Unauthorized';

        return callback(error)
    }

    jwt.verify(obj.jwt_refresh, certPublic, (err, decoded_refresh) => {
        if (err || !decoded_refresh) {
            error           = new Error();
            error.status    = 401;
            error.message   = 'Unauthorized';

            return callback(error)
        }

        if (decoded_refresh.is_valid !== true) {
            error           = new Error();
            error.status    = 401;
            error.message   = 'Unauthorized';

            return callback(error)
        }

        jwt.verify(obj.jwt_access, certPublic, (err, decoded_access) => {
            if (err) {
                decoded_access = jwt.decode(obj.jwt_access);

                if (!decoded_access) {
                    error           = new Error();
                    error.status    = 401;
                    error.message   = 'Unauthorized';

                    return callback(error)
                }

                if (decoded_access.last_pw_change !== decoded_refresh.last_pw_change) {
                    error           = new Error();
                    error.status    = 401;
                    error.message   = 'Unauthorized';

                    return callback(error)
                }

                let user_info = {
                    _id             : decoded_access._id,
                    role            : decoded_access.role,
                    role_relation   : decoded_access.role_relation,
                    username        : decoded_access.username,
                    last_pw_change  : decoded_access.last_pw_change
                };

                if (decoded_access.can_access) user_info.can_access = decoded_access.can_access;

                return callback(null, user_info)
            }

            if (decoded_access.last_pw_change !== decoded_refresh.last_pw_change) {
                error           = new Error();
                error.status    = 401;
                error.message   = 'Unauthorized';

                return callback(error)
            }

            let user_info = {
                _id             : decoded_access._id,
                role            : decoded_access.role,
                role_relation   : decoded_access.role_relation,
                username        : decoded_access.username,
                last_pw_change  : decoded_access.last_pw_change
            };

            if (decoded_access.can_access) user_info.can_access = decoded_access.can_access;

            return callback(null, user_info)
        })
    })
}
