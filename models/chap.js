const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('chaps');

let requiredFields = ['bookId', 'name'],
    updateFields = ['name', 'status', 'no'],
    createFields = updateFields.concat(['bookId']);

module.exports.fields = {requiredFields, updateFields, createFields};