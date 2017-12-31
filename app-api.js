let express = require('express');

let login = require('./routes/login');
let books = require('./routes/books');
let chaps = require('./routes/chaps');
let dict = require('./routes/dict');
let voca = require('./routes/vocabulary');

let api = express();

api.use('/login', login);
api.use('/books', books);
api.use('/chaps', chaps);
api.use('/dict', dict);
api.use('/voca', voca);

module.exports = api;
