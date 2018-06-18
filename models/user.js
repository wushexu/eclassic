const bcrypt = require('bcrypt');
const {simpleCurd} = require('./db');
const {SiteSalt} = require('../common/config');

let User = simpleCurd('users');

let requiredFields = ['name', 'pass', 'nickName'],
    updateFields = ['gender', 'role', 'status', 'accessToken'],
    createFields = requiredFields.concat(updateFields);

User.fields = {requiredFields, updateFields, createFields};


let hashPass = function (pass, userSalt) {
    let salt = userSalt + '.' + SiteSalt;
    return bcrypt.hashSync(pass, salt);
};

User.hashPassword = function (user) {
    if (!user.salt) {
        user.salt = bcrypt.genSaltSync();
    }
    user.pass = hashPass(user.pass, user.salt);
};

let create0 = User.create;

User.create = function (user) {
    User.hashPassword(user);
    create0(user);
};

User.checkPass = function (user, pass) {
    let hash = hashPass(pass, user.salt);
    return (hash === user.pass);
};

User.authenticate = function (name, pass) {
    if (pass === '') {
        return null;
    }
    return User.coll().findOne({name}).then(
        (user) => {
            if (!user) {
                return null;
            }
            let match = User.checkPass(user, pass);
            if (match) {
                user.pass = null;
                user.salt = null;
                return user;
            }
            return null;
        });
};

const Roles = User.Roles = {Admin: 'Admin', Editor: 'Editor'};

User.adminOrEditor = function (user) {
    return user &&
        (user.role === Roles.Admin
            || user.role === Roles.Editor);
};

module.exports = User;
