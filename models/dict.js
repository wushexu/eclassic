const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word','explain'],
    updateFields = ['nextItemId','explain', 'phonetic', 'categories',
        'complete', 'forms', 'phrases', 'sentences', 'usageTips'],
    createFields = updateFields.concat(['word']);

module.exports.fields = {requiredFields, updateFields, createFields};
