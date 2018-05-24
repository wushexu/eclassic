const {simpleCurd} = require('./db');

module.exports = simpleCurd('paras');

let requiredFields = ['chapId', 'bookId', 'content'],
    updateFields = ['content', 'trans', 'no'],
    createFields = updateFields.concat(['chapId', 'bookId', 'originalId']);

module.exports.fields = {requiredFields, updateFields, createFields};
