let express = require('express');
let router = express.Router();

const {HeaderNames, SessionKeys} = require('../common/config');
const {wrapAsync, modelIdString} = require('../common/helper');
const validate = require('../middleware/validate');
const User = require('../models/user');
const UserPreference = require('../models/user_preference');


const UID_BASE = 50;
const NameLengthRange = [4, 24];
const NickLengthRange = [2, 16];
const PassLengthRange = [4, 32];
const NamePattern = /^[a-z][_a-z0-9]+$/i;
const NickPattern = /^[a-zA-Z\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\u{20000}-\u{2A6D6}\u{2A700}-\u{2B734}\u{2B740}-\u{2B81D}\u{2B820}-\u{2CEA1}\u{2CEB0}-\u{2EBE0}]+$/u;


async function maxUid() {
    let last = await User.coll()
        .findOne({}, {
            fields: {uid: 1},
            sort: {uid: -1}
        });
    let max = UID_BASE;
    if (last && last.uid && last.uid > UID_BASE) {
        max = last.uid;
    }
    return max;
}

async function checkUniqueness(req, res, next) {
    let {name} = req.body;
    let occupied = await User.exists({name});
    res.json({ok: occupied ? 0 : 1});
}

function checkLengthRange(name, value, [min, max]) {
    let len = value.length;
    if (len < min) {
        return name + "太短";
    }
    if (len > max) {
        return name + "太长";
    }
    return null;
}

function validateForm(user) {
    let {name, pass, nickName} = user;
    let message = checkLengthRange('用户名', name, NameLengthRange)
        || checkLengthRange('昵称', nickName, NickLengthRange)
        || checkLengthRange('密码', pass, PassLengthRange);
    if (message) {
        return message;
    }
    if (!NamePattern.test(name)) {
        return "用户名不合法";
    }
    if (!NickPattern.test(nickName)) {
        return "昵称不合法";
    }
    return null;
}

async function register(req, res, next) {
    let {name, nickName, pass} = req.body;
    let occupied = await User.exists({name});
    if (occupied) {
        res.json({ok: 0, message: "用户名已存在"});
        return;
    }

    let user = {name, pass, nickName};

    let msg = validateForm(user);
    if (msg) {
        res.json({ok: 0, message: msg});
        return;
    }

    let uid = await maxUid();
    user.uid = ++uid;

    await User.create(user);
    let userId = modelIdString(user);
    await UserPreference.create({userId, baseVocabulary: 'basic', wordTags: ['basic', 'cet', 'gre', 'coca']});

    res.json({ok: 1});

}

router.post('/checkUniqueness',
    validate.required(['name']),
    wrapAsync(checkUniqueness)
);

// Register
router.post('/',
    validate.required(['name', 'nickName', 'pass']),
    wrapAsync(register)
);


module.exports = router;
