const User = require('../models/user');
const {errorHandler} = require('../common/helper');

module.exports = (req, res, next) => {
    let uid = req.session && req.session.uid;
    if (!uid) {
        return next();
    }
    let eh = errorHandler(req, res);
    User.getById(uid).then(
        (user) => {
            delete user.pass;
            delete user.salt;
            res.locals.user = user;
            next();
        }).catch(eh);
};
