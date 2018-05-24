let express = require('express');
let router = express.Router();

let UserBaseVocabulary = require('../models/user_base_vocabulary');
let {wrapAsyncOne, modelIdString} = require('../common/helper');


async function baseVocabularyCategories(req, res, next) {
    let userId = modelIdString(req.user);
    let ubvs = await UserBaseVocabulary.find({userId}, {_id: 0, categoryCode: 1});
    let categoryCodes = ubvs.map(b => b.categoryCode);
    res.json(categoryCodes);
}

async function resetBaseVocabulary(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let codes = req.body.codes;
    if (!codes) {
        return res.json({ok: 0});
    }
    if (typeof codes === 'string') {
        codes = [codes];
    }
    await UserBaseVocabulary.coll().deleteMany({userId});

    let bulkOperations = codes.map(categoryCode => {
        return {insertOne: {document: {userId, categoryCode}}};
    });
    await UserBaseVocabulary.coll().bulkWrite(bulkOperations);

    res.json({ok: 1});
}


router.get('/', wrapAsyncOne(baseVocabularyCategories));
router.post('/reset', wrapAsyncOne(resetBaseVocabulary));

module.exports = router;
