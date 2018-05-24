const {simpleCurd} = require('./db');

let Para = simpleCurd('paras');

let requiredFields = ['chapId', 'bookId', 'content'],
    updateFields = ['content', 'trans', 'no'],
    createFields = updateFields.concat(['chapId', 'bookId', 'originalId']);

Para.fields = {requiredFields, updateFields, createFields};

module.exports = Para;
