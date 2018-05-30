const {simpleCurd} = require('./db');

let UserPreference = simpleCurd('user_preferences');

let requiredFields = ['userId'],
    updateFields = ['baseVocabulary', 'wordTags'],
    createFields = updateFields.concat(requiredFields);

UserPreference.fields = {requiredFields, updateFields, createFields};

module.exports = UserPreference;
