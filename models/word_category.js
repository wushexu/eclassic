const {simpleCurd} = require('./db');

let WordCategory = simpleCurd('word_categories');

let requiredFields = ['code', 'name', 'dictKey'],
    updateFields = ['name', 'dictOperator', 'dictValue', 'description', 'wordCount', 'extendTo',
        'extendedWordCount', 'no'],
    createFields = updateFields.concat(requiredFields);

WordCategory.fields = {requiredFields, updateFields, createFields};

WordCategory.buildFilter = function (wordCategory) {
    let fk = 'categories.' + wordCategory.dictKey;
    let val = wordCategory.dictValue;
    let op = wordCategory.dictOperator;
    let filter = {};
    if (!op) {
        filter[fk] = val;
    } else if (['gt', 'lt', 'ne'].indexOf(op) >= 0) {
        filter[fk] = {['$' + op]: val}
    } else {
        console.log('unknown key: ' + fk);
        filter[fk] = val;
    }
    return filter;
};

module.exports = WordCategory;
