const {simpleCurd} = require('./db');

let WordCategory = simpleCurd('word_categories');

let requiredFields = ['code', 'name', 'dictKey'],
    updateFields = ['dictOperator', 'dictValue', 'description', 'wordCount', 'extendTo',
        'extendedWordCount', 'isFrequency', 'useAsUserBase', 'no'],
    createFields = updateFields.concat(requiredFields);

WordCategory.fields = {requiredFields, updateFields, createFields};

WordCategory.buildFilter = function (wordCategory) {
    let fk = 'categories.' + wordCategory.dictKey;
    let val = wordCategory.dictValue;
    let op = wordCategory.dictOperator;
    let filter = {};
    if (!op) {
        filter[fk] = val;
    } else if (['gt', 'gte', 'lt', 'lte', 'ne'].indexOf(op) >= 0) {
        filter[fk] = {['$' + op]: val}
    } else if (op === 'exist') {
        filter[fk] = {$exist: true};
    } else if (op === 'not-exist') {
        filter[fk] = {$exist: false};
    } else {
        console.log('unknown key: ' + fk);
        filter[fk] = val;
    }
    return filter;
};

module.exports = WordCategory;
