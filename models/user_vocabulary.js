const {simpleCurd} = require('./db');

let UserVocabulary = simpleCurd('user_vocabulary');

let requiredFields = ['userId', 'word'],
    updateFields = ['bookId', 'chapId', 'paraId', 'familiarity'],
    createFields = updateFields.concat(requiredFields);

UserVocabulary.fields = {requiredFields, updateFields, createFields};

UserVocabulary.Familiarities = [
    {value: 1, label: '很陌生'},
    {value: 2, label: '熟悉中'},
    {value: 3, label: '已掌握'}
];

module.exports = UserVocabulary;
