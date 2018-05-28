const {simpleCurd} = require('./db');

let WordCategory = simpleCurd('word_categories');

let requiredFields = ['code', 'name', 'dictCategoryKey', 'dictCategoryValue'],
    updateFields = ['description', 'wordCount', 'extendTo', 'extendedWordCount', 'isFrequency', 'useAsUserBase', 'no'],
    createFields = updateFields.concat(requiredFields);

WordCategory.fields = {requiredFields, updateFields, createFields};

module.exports = WordCategory;
