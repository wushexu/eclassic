let express = require('express');
let router = express.Router();
// let debug = require('debug')('cr:session');
const {SessionKeys} = require('../common/config');

let {wrapAsync, idString} = require('../common/helper');
const validate = require('../middleware/validate');
const User = require('../models/user');


router.get(['/', '/form'], (req, res) => {
    res.render('login');
});

async function login(req, res, next) {
    const {name, pass} = req.body;
    let user = await User.authenticate(name, pass);
    if (!user) {
        res.locals.message = '用户名/密码错误';
        res.render('login');
        return;
    }
    req.session[SessionKeys.UserId] = idString(user._id);
    req.session.save(function (err) {
        if (err) console.error("err:" + err);
        res.redirect('/f');
    });
}

// Login
router.post('/',
    validate.required(['name', 'pass']),
    wrapAsync(login)
);

router.delete('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("err:" + err);
        res.redirect('/f');
    });
});

router.get('/userinfo', function (req, res, next) {
    if (req.user) {
        let u = req.user;
        res.json({login: true, name: u.name});
    } else {
        res.json({login: false});
    }
});


module.exports = router;
