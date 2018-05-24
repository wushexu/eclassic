const User = require('../models/user');
const {errorHandler} = require('../common/helper');
const {HeaderNames, SessionKeys} = require('../common/config');

module.exports = async (req, res, next) => {
    let user = null;
    let uid = req.session && req.session[SessionKeys.UserId];
    if (uid) {
        user = await User.getById(uid);
    } else {
        let accessToken = req.header(HeaderNames.UserToken);
        if (accessToken) {
            //find User By token
        }
    }
    // let client = req.header('Client');// PC/Android
    // let appVersion = req.header('App-Version');

    if (user) {
        delete user.pass;
        delete user.salt;
        req.user = res.locals.user = user;
        console.log('user: ' + user.name + ', ' + user.role);
    }
    next();
};
