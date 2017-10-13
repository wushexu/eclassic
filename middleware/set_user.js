const User = require('../models/user');
const {sendError} = require('../helper/helper');

module.exports = (req, res, next) => {
    let uid = req.session.uid;
    if (!uid) {
        return next();
    }
    let eh = sendError(req, res);
    User.getById(uid).then(
        (user) => {
            req.user = res.locals.user = user;
            next();
        },
        eh).catch(eh);
};
