const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word'],
    updateFields = ['meaning', 'phonetic', 'categories',
        'complete', 'forms', 'phrases', 'sentences', 'usageTips'],
    createFields = requiredFields.concat(updateFields);

module.exports.fields = {requiredFields, updateFields, createFields};
