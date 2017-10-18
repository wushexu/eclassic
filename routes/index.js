let express = require('express');
let router = express.Router();

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

module.exports = router;
