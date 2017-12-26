let express = require('express');

let users = require('./routes/admin/users');
let books = require('./routes/admin/books');
let chaps = require('./routes/admin/chaps');
let paras = require('./routes/admin/paras');
let dict = require('./routes/admin/dict');
let userBooks = require('./routes/admin/user_books');

let api = express();

api.use('/users', users);
api.use('/books', books);
api.use('/chaps', chaps);
api.use('/paras', paras);
api.use('/dict', dict);
api.use('/user_books', userBooks);

module.exports = api;
