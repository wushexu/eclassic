const bcrypt = require('bcrypt');
const {getDb, simpleCurd} = require('./db');

let {
    coll,
    find,
    exists,
    getById,
    getByName,
    create: create0,
    update,
    remove
} = simpleCurd('users');

function hashPassword(user) {
    return bcrypt.genSalt().then(
        (salt) => {
            user.salt = salt;
            return bcrypt.hash(user.pass, salt).then(
                (hash) => {
                    user.pass = hash;
                    return user;
                });
        });
}

function create(user) {
    return hashPassword(user).then(create0);
}

function authenticate(name, pass) {
    return getByName(name).then(
        (user) => {
            if (!user) {
                // return new Promise(function(resolve, reject) {
                //     resolve(null);
                // });
                return null;
            }
            return bcrypt.hash(pass, user.salt).then(
                (hash) => {
                    if (hash === user.pass) {
                        return user;
                    }
                    return null;
                });
        });
}

let requiredFields = ['name', 'pass'],
    updateFields = ['gender', 'role', 'status'],
    createFields = requiredFields.concat(updateFields);

module.exports = {
    find,
    exists,
    getById,
    getByName,
    create,
    update,
    remove,
    authenticate,
    fields: {requiredFields, updateFields, createFields}
};
