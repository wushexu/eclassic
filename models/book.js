const {getDb, simpleCurd} = require('./db');


module.exports = simpleCurd('books');

let requiredFields = ['name'],
    updateFields = requiredFields.concat(['author', 'status','no']),
    createFields = updateFields;

module.exports.fields = {requiredFields, updateFields, createFields};
