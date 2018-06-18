const {simpleCurd} = require('./db');

let UserWord = simpleCurd('user_words');

let requiredFields = ['userId', 'word'],
    updateFields = ['bookId', 'chapId', 'paraId', 'familiarity', 'lastTouch'],
    createFields = updateFields.concat(requiredFields);

UserWord.fields = {requiredFields, updateFields, createFields};

UserWord.Familiarities = [
    {value: 1, label: '很陌生'},
    {value: 2, label: '熟悉中'},
    {value: 3, label: '已掌握'}
];

module.exports = UserWord;
