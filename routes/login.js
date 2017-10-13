let express = require('express');
let router = express.Router();
let debug = require('debug')('cr:session');
let stringify = require('stringify-object');

const validate = require('../middleware/validate');

const User = require('../models/user');

router.get('/', (req, res) => {
    // let message=req.flash('message');
    // if(message){
    //     res.locals.message=message;
    // }
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
                res.redirect('/');
            }
        });
        //debug(stringify(req.headers));
    });
}

// Login
router.post('/',
    validate.required(['name', 'pass']),
    (req, res, next) => {
        const {name, pass} = req.body;
        User.authenticate(name, pass).then(
            (user) => {
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
            },
            (err) => {
                console.err(err);
                let message = 'Login failed.';
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
        );
    }
);

router.delete('/', (req, res) => {
    console.log("user exit ...");
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
                res.redirect('/');
            }
        });
    });
});


module.exports = router;