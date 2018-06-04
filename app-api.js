let express = require('express');
const {errorHandler} = require('./common/helper');

let login = require('./routes/login');
let books = require('./routes/books');
let chaps = require('./routes/chaps');
let paras = require('./routes/paras');
let dict = require('./routes/dict');
let userWords = require('./routes/user_words');
let userBooks = require('./routes/user_books');
let wordCategories = require('./routes/word_categories');
let userPreferences = require('./routes/user_preferences');
let annotationFamilies = require('./routes/annotation_families');

function authorize(req, res, next) {
    if (req.method === 'OPTIONS') {
        return next();
    }
    let url = req.url;
    if (url.startsWith('/login')) {
        return next();
    }

    let user = res.locals.user;

    if (!user) {
        let eh = errorHandler(req, res);
        if (url.startsWith('/user_words')
            || url.startsWith('/user_books')
            || url.startsWith('/word_categories')
            || url.startsWith('/user_preferences')) {
            return eh({status: 401, message: 'Need Login.'});
        }
        if (req.method !== 'GET') {
            return eh({status: 401, message: 'Need Login.'});
        }
    }
    next();
}


let api = express();

api.use(authorize);
api.use('/login', login);
api.use('/books', books);
api.use('/chaps', chaps);
api.use('/paras', paras);
api.use('/dict', dict);
api.use('/user_words', userWords);
api.use('/user_books', userBooks);
api.use('/word_categories', wordCategories);
api.use('/user_preferences', userPreferences);
api.use('/annotation_families', annotationFamilies);

module.exports = api;
