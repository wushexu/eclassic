let express = require('express');
let router = express.Router();

let {wrapAsync} = require('../common/helper');
let {canReadChap} = require('../common/permissions');

let Chap = require('../models/chap');
let Para = require('../models/para');


function getChap(req, res, next) {
    Chap.releasedChap(req.params._id)
        .then(chap => res.json(chap))
        .catch(next);
}

async function chapDetail(req, res, next) {

    const chapId = req.params._id;
    const chap = await Chap.releasedChap(chapId);
    if (!chap) {
        return res.json(null);
    }

    let hasPermission = await canReadChap(req.user, chap);
    if (!hasPermission) {
        return res.json(chap);
    }

    chap.paras = await Para.coll()
        .find({chapId})
        .project({content: 1, trans: 1, no: 1, version: 1})
        .sort({no: 1})
        .toArray();

    res.json(chap);
}

async function paraVersions(req, res, next) {

    const chapId = req.params._id;
    const chap = await Chap.releasedChap(chapId);
    if (!chap) {
        return res.json(null);
    }

    let hasPermission = await canReadChap(req.user, chap);
    if (!hasPermission) {
        return res.json(null);
    }

    let paras = await Para.coll()
        .find({chapId})
        .project({version: 1})
        .sort({no: 1})
        .toArray();

    res.json(paras);
}


router.get('/:_id', getChap);
router.get('/:_id/detail', wrapAsync(chapDetail));
router.get('/:_id/paraVersions', wrapAsync(paraVersions));

module.exports = router;
