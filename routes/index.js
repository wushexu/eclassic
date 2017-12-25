let express = require('express');
let router = express.Router();

const {reqParam, wrapAsyncOne} = require('../common/helper');

router.get('/f', function (req, res, next) {
    res.render('index');
});

router.get('/userinfo', function (req, res, next) {
    if (req.user) {
        let u = req.user;
        res.send({login: true, name: u.name});
    } else {
        res.send({login: false});
    }
});

async function resetPass(req, res, next) {

    let user = req.user;
    if (!user) {
        res.json({ok: 0});
    }
    let newPass = reqParam(req, 'newPass');
    if (!newPass) {
        res.json({ok: 0, message: 'Missing New Pass'});
    }
    let pass = reqParam(req, 'pass');
    await match = User.checkPass(user, pass);
    if (!match) {
        res.json({ok: 0, message: 'Wrong Pass'});
    }
    user.salt = null;
    user.pass = newPass;
    User.hashPassword();
    await User.coll()
        .updateOne({_id: user.id},
            {$set: {pass: newPass, salt: user.salt}});

    res.json({ok: 1});
}

router.post('/reset_pass', wrapAsyncOne(resetPass));

module.exports = router;
