const User = require('../models/user');
const {sendError} = require('../common/helper');

module.exports = (req, res, next) => {
    let uid = req.session && req.session.uid;
    if (!uid) {
        return next();
    }
    let eh = sendError(req, res);
    User.getById(uid).then(
        (user) => {
            console.log("User: " + user.name);
            delete user.pass;
            delete user.salt;
            req.user = res.locals.user = user;
            next();
        }).catch(eh);
};
