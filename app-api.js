let express = require('express');

let books = require('./routes/books');
let chaps = require('./routes/chaps');
let dict = require('./routes/dict');

let api = express();

api.use('/books', books);
api.use('/chaps', chaps);
api.use('/dict', dict);

module.exports = api;
