const {simpleCurd} = require('./db');

module.exports = simpleCurd('user_vocabulary');

let requiredFields = ['userId', 'word'],
    updateFields = ['bookId', 'chapId', 'paraId', 'familiarity'],
    createFields = updateFields.concat(requiredFields);

module.exports.fields = {requiredFields, updateFields, createFields};
