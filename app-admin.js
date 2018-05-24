let express = require('express');
const {errorHandler} = require('./common/helper');
let User = require('./models/user');

let login = require('./routes/login');
let users = require('./routes/admin/users');
let books = require('./routes/admin/books');
let chaps = require('./routes/admin/chaps');
let paras = require('./routes/admin/paras');
let dict = require('./routes/admin/dict');
let userBooks = require('./routes/admin/user_books');

function authorize(req, res, next) {
    if (req.method === 'OPTIONS') {
        return next();
    }
    let url = req.url;
    if (url.startsWith('/login')) {
        return next();
    }

    let user = res.locals.user;
    let eh = errorHandler(req, res);

    if (!user) {
        eh({status: 401, message: '21 Need Login.'});
        return;
    }
    if (!User.adminOrEditor(user)) {
        eh({status: 401, message: '22 Unauthorized.'});
        return;
    }
    if (url.startsWith('/users') && user.role !== User.Roles.Admin) {
        eh({status: 401, message: '23 Unauthorized.'});
        return;
    }
    next();
}


let api = express();

api.use(authorize);
api.use('/login', login);
api.use('/users', users);
api.use('/books', books);
api.use('/chaps', chaps);
api.use('/paras', paras);
api.use('/dict', dict);
api.use('/user_books', userBooks);

module.exports = api;
