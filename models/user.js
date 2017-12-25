const bcrypt = require('bcrypt');
const {simpleCurd} = require('./db');

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

function hashPass(pass, userSalt) {
    let siteSalt = 'wwwsjyxym1221';
    let salt = userSalt + '.' + siteSalt;
    return bcrypt.hashSync(pass, salt);
}

function hashPassword(user) {
    if (!user.salt) {
        user.salt = bcrypt.genSaltSync();
    }
    user.pass = hashPass(user.pass, user.salt);
}

function create(user) {
    hashPassword(user);
    create0(user);
}

function checkPass(user, pass) {
    let hash = hashPass(pass, user.salt);
    return (hash === user.pass);
}

function authenticate(name, pass) {
    if (pass === '') {
        return null;
    }
    return getByName(name).then(
        (user) => {
            if (!user) {
                return null;
            }
            let match = checkPass(user, pass);
            if (match) {
                user.pass = null;
                user.salt = null;
                return user;
            }
            return null;
        });
}

let requiredFields = ['name', 'pass'],
    updateFields = ['gender', 'role', 'status'],
    createFields = requiredFields.concat(updateFields);

module.exports = {
    coll,
    find,
    exists,
    getById,
    getByName,
    create,
    update,
    remove,
    hashPassword,
    authenticate,
    checkPass,
    fields: {requiredFields, updateFields, createFields}
};
