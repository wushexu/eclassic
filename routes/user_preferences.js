let express = require('express');
let router = express.Router();

let UserPreference = require('../models/user_preference');
let {wrapAsync, modelIdString} = require('../common/helper');


async function get(req, res, next) {
    let userId = modelIdString(req.user);
    let up = await UserPreference.coll().findOne({userId});
    res.json(up);
}


async function setBaseVocabulary(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let categoryCode = req.body.categoryCode;
    if (!categoryCode) {
        return res.json({ok: 0});
    }
    if (typeof categoryCode !== 'string') {
        return res.json({ok: 0, message: 'Wrong Parameters.'});
    }

    let up = await UserPreference.coll().findOne({userId});
    if (up) {
        await UserPreference.update(up._id, {baseVocabulary: categoryCode});
    } else {
        await UserPreference.create({userId, baseVocabulary: categoryCode});
    }

    res.json({ok: 1});
}

async function setWordTags(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let categoryCodes = req.body;
    if (!categoryCodes) {
        return res.json({ok: 0});
    }
    for (let code of categoryCodes) {
        if (typeof code !== 'string') {
            return res.json({ok: 0, message: 'Wrong Parameters.'});
        }
    }

    let up = await UserPreference.coll().findOne({userId});
    if (up) {
        await UserPreference.update(up._id, {wordTags: categoryCodes});
    } else {
        await UserPreference.create({userId, wordTags: categoryCodes});
    }

    res.json({ok: 1});
}


router.get('/', wrapAsync(get));
router.post('/baseVocabulary', wrapAsync(setBaseVocabulary));
router.post('/wordTags', wrapAsync(setWordTags));

module.exports = router;
