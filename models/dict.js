const {simpleCurd} = require('./db');

module.exports = simpleCurd('dict');

let requiredFields = ['word'];
let updateFields = ['simpleHc', 'simpleYd', 'completeHc', 'completeYd',
    'simple', 'complete', 'categories', 'phonetics', 'forms', 'baseForms',
    'wordLength', 'wordCount', 'isPhrase', 'phrases', 'phraseCount'];
let createFields = updateFields.concat(['word']);

module.exports.fields = {requiredFields, updateFields, createFields};
