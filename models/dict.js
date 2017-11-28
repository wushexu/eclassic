const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word', 'explain'],
    updateFields = ['explain', 'simpleHc', 'simpleYd',
        'categories', 'complete', 'completeHc', 'completeYd',
        'nextItemId', 'phonetics', 'forms', 'formOf', 'phrases', /*'usageTips'*/],
    createFields = updateFields.concat(['word']);

module.exports.fields = {requiredFields, updateFields, createFields};
