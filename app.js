let express = require('express');
let session = require('express-session');
let methodOverride = require('method-override');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
//let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let {sendError} = require('./helper/helper');

let cors = require('./middleware/cors');
let log_headers = require('./middleware/log_headers');
let log_params = require('./middleware/log_params');
let connect_db = require('./middleware/connect_db');
let set_user = require('./middleware/set_user');

let index = require('./routes/index');
let login = require('./routes/login');
let users = require('./routes/users');
let books = require('./routes/books');
let chaps = require('./routes/chaps');
let paras = require('./routes/paras');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser());
app.use(session({secret: 'qaz234', resave: false, saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.use(cors);
app.use(log_headers);
app.use(log_params);
app.use(connect_db);
app.use(set_user);

let api = express();
app.use('/api', api);

api.use('/', index);
api.use('/login', login);
api.use('/users', users);
api.use('/books', books);
api.use('/chaps', chaps);
api.use('/paras', paras);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    sendError(req, res)(err);
});

module.exports = app;
