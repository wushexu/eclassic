const {simpleCurd} = require('./db');

module.exports = simpleCurd('user_books');

let requiredFields = ['userId', 'bookId'],
    // chaps:[{chapId,role},...]
    updateFields = ['isAllChaps', 'chaps', 'chapsCount', 'role'],
    createFields = updateFields.concat(requiredFields);

module.exports.fields = {requiredFields, updateFields, createFields};
