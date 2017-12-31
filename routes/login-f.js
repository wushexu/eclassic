let express = require('express');
let router = express.Router();
// let debug = require('debug')('cr:session');

let {wrapAsyncOne} = require('../common/helper');
const validate = require('../middleware/validate');
const User = require('../models/user');


router.get('/', (req, res) => {
    res.render('login');
});

router.get('/form', (req, res) => {
    res.render('login');
});

function doLogin(req, res, user) {
    req.session.uid = user._id;
    req.session.save(function (err) {
        if (err) console.error("err:" + err);
        res.format({
            json: () => {
                if (err) {
                    res.send({ok: 0, message: err.message});
                } else {
                    res.send({ok: 1});
                }
            },
            html: () => {
                res.redirect('/f');
            }
        });
    });
}

async function login(req, res, next) {

    const {name, pass} = req.body;
    let user = await User.authenticate(name, pass);
    if (user) {
        doLogin(req, res, user);
    } else {
        let message = 'Sorry! invalid credentials.';
        res.format({
            json: () => {
                res.send({ok: 0, message: message});
            },
            html: () => {
                res.locals.message = message;
                res.render('login');
            }
        });
    }
}

// Login
router.post('/',
    validate.required(['name', 'pass']),
    wrapAsyncOne(login)
);

router.delete('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("err:" + err);
        res.format({
            json: () => {
                if (err) {
                    res.send({ok: 0, message: err.message});
                } else {
                    res.send({ok: 1});
                }
            },
            html: () => {
                res.redirect('/f');
            }
        });
    });
});

router.get('/userinfo', function (req, res, next) {
    if (req.user) {
        let u = req.user;
        res.send({login: true, name: u.name});
    } else {
        res.send({login: false});
    }
});


module.exports = router;
