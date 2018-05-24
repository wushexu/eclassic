let express = require('express');
const {errorHandler} = require('./common/helper');

let login = require('./routes/login');
let books = require('./routes/books');
let chaps = require('./routes/chaps');
let paras = require('./routes/paras');
let dict = require('./routes/dict');
let voca = require('./routes/vocabulary');
let userBooks = require('./routes/user_books');

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
        if (req.method !== 'GET') {
            eh({status: 401, message: '11 Need Login.'});
            return;
        }
        if (url.startsWith('/voca') || url.startsWith('/user_books')) {
            eh({status: 401, message: '12 Need Login.'});
            return;
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
api.use('/voca', voca);
api.use('/user_books', userBooks);

module.exports = api;
