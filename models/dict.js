const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word', 'explain'],
    updateFields = ['nextItemId', 'explain', 'phonetics', 'categories',
        'complete', 'forms', 'formOf'/*, 'phrases', 'sentences', 'usageTips'*/],
    createFields = updateFields.concat(['word']);

module.exports.fields = {requiredFields, updateFields, createFields};
