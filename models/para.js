const {simpleCurd} = require('./db');

module.exports = simpleCurd('paras');

let requiredFields = ['chapId', 'content'],
    updateFields = ['content', 'trans', 'no'],
    createFields = updateFields.concat(['chapId']);

module.exports.fields = {requiredFields, updateFields, createFields};
