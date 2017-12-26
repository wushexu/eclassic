let express = require('express');

let books = require('./routes/books');

let api = express();

api.use('/books', books);

module.exports = api;
