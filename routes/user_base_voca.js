let express = require('express');
let router = express.Router();

let UserBaseVocabulary = require('../models/user_base_vocabulary');
let {wrapAsync, modelIdString} = require('../common/helper');


async function list(req, res, next) {
    let userId = modelIdString(req.user);
    let ubvs = await UserBaseVocabulary.find({userId}, {_id: 0, categoryCode: 1});
    res.json(ubvs);
}

async function reset(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let bvs = req.body;
    if (!bvs) {
        return res.json({ok: 0});
    }
    if (typeof bvs.length === 'undefined') {
        bvs = [bvs];
    }
    for (let bv of bvs) {
        if (typeof bv === 'string') {
            bv = {categoryCode: bv};
        }
        bv.userId = userId;
    }
    await UserBaseVocabulary.coll().deleteMany({userId});

    let bulkOperations = bvs.map(bv => {
        return {insertOne: {document: bv}};
    });
    await UserBaseVocabulary.coll().bulkWrite(bulkOperations);

    res.json({ok: 1});
}


router.get('/', wrapAsync(list));
router.post('/', wrapAsync(reset));

module.exports = router;
