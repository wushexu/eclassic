const {simpleCurd} = require('./db');

let UserBaseVocabulary = simpleCurd('user_base_vocabulary');

let requiredFields = ['userId', 'categoryCode'],
    updateFields = [],
    createFields = updateFields.concat(requiredFields);

UserBaseVocabulary.fields = {requiredFields, updateFields, createFields};

module.exports = UserBaseVocabulary;
