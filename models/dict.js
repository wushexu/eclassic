const {getDb, simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word', 'simple'];
let updateFields = ['simple', 'simpleHc', 'simpleYd',
    'categories', 'complete', 'completeHc', 'completeYd',
    'nextItemId', 'phonetics', 'forms', 'baseForms', 'wordLength', 'wordCount', 'isPhrase',
    'phrases', 'phraseCount'/*, 'usageTips'*/];
let createFields = updateFields.concat(['word']);

module.exports.fields = {requiredFields, updateFields, createFields};
