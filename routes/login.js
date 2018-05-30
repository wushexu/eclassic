let express = require('express');
let router = express.Router();

const {HeaderNames, SessionKeys} = require('../common/config');
let {wrapAsync, idString} = require('../common/helper');
const validate = require('../middleware/validate');
const User = require('../models/user');


async function login(req, res, next) {
    const {name, pass} = req.body;
    let user = await User.authenticate(name, pass);
    if (!user) {
        let message = 'Invalid Credentials.';
        res.send({ok: 0, message: message});
        return;
    }

    // let accessToken = req.header(HeaderNames.xxx);
    // let client = req.header(HeaderNames.xxx);// PC/Android
    // TODO: set accessToken, if from app
    req.session[SessionKeys.UserId] = idString(user._id);
    req.session.save(function (err) {
        if (err) {
            console.error("err:" + err);
            res.send({ok: 0, message: err.message});
        } else {
            let result = {ok: 1};
            if (user.role) {
                result.role = user.role;
            }
            res.send(result);
        }
    });
}

// Login
router.post('/',
    validate.required(['name', 'pass']),
    wrapAsync(login)
);

router.delete('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("err:" + err);
            res.send({ok: 0, message: err.message});
        } else {
            res.send({ok: 1});
        }
    });
});

router.get('/userinfo', function (req, res, next) {
    if (req.user) {
        let u = req.user;
        let result = {login: true, name: u.name};
        if (u.role) {
            result.role = u.role;
        }
        res.send(result);
    } else {
        res.send({login: false});
    }
});

module.exports = router;
