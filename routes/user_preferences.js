let express = require('express');
let router = express.Router();

let UserPreference = require('../models/user_preference');
let {wrapAsync, modelIdString} = require('../common/helper');


async function get(req, res, next) {
    let userId = modelIdString(req.user);
    let up = await UserPreference.coll().findOne({userId});
    res.json(up);
}


async function save(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let preference = req.body;
    if (typeof preference !== 'object') {
        return res.json({ok: 0});
    }
    preference.userId = userId;

    let up = await UserPreference.coll().findOne({userId});
    if (up) {
        await UserPreference.update(up._id, preference);
    } else {
        await UserPreference.create(preference);
    }

    res.json({ok: 1});
}


async function setValue(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let preference = req.body;
    if (typeof preference !== 'object') {
        return res.json({ok: 0});
    }

    let code = req.params.code;

    let value = preference[code];
    if (typeof value === 'undefined') {
        return res.json({ok: 0});
    }

    let up = await UserPreference.coll().findOne({userId});
    if (up) {
        await UserPreference.update(up._id, {[code]: value});
    } else {
        await UserPreference.create({userId, [code]: value});
    }

    res.json({ok: 1});
}


router.get('/', wrapAsync(get));
router.post('/', wrapAsync(save));
router.post('/code/:code', wrapAsync(setValue));

module.exports = router;
