const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word', 'explain'];
let updateFields = ['explain', 'simpleHc', 'simpleYd',
    'categories', 'complete', 'completeHc', 'completeYd',
    'nextItemId', 'phonetics', 'forms', 'baseForms',
    'phrases', 'phrases2', /*'usageTips'*/];
let createFields = updateFields.concat(['word']);

module.exports.fields = {requiredFields, updateFields, createFields};
