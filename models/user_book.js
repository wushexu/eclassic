const {simpleCurd} = require('./db');

let UserBook = simpleCurd('user_books');

let requiredFields = ['userId', 'bookId'],
    // chaps:[{chapId,role},...]
    updateFields = ['isAllChaps', 'chaps', 'chapsCount', 'role'],
    createFields = updateFields.concat(requiredFields);

UserBook.fields = {requiredFields, updateFields, createFields};

const Roles = UserBook.Roles = {Owner: 'Owner', Editor: 'Editor'};

UserBook.ownerOrEditor = function (userBook) {
    return userBook &&
        (userBook.role === Roles.Owner
            || userBook.role === Roles.Editor);
};

module.exports = UserBook;
