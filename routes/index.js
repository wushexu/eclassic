let express = require('express');
let router = express.Router();

const {reqParam, wrapAsync, idString} = require('../common/helper');

router.get(['/', '/f'], function (req, res, next) {
    res.render('index');
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
    match = await User.checkPass(user, pass);
    if (!match) {
        res.json({ok: 0, message: 'Wrong Pass'});
    }
    user.salt = null;
    user.pass = newPass;
    User.hashPassword(user);
    let _id = idString(user._id);
    await User.coll()
        .updateOne({_id},
            {$set: {pass: newPass, salt: user.salt}});

    res.json({ok: 1});
}

router.post('/reset_pass', wrapAsync(resetPass));

module.exports = router;
