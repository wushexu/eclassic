let express = require('express');
let router = express.Router();

let {getLimit, wrapAsyncOne} = require('../common/helper');
let {canReadChap, evaluateUserContents} = require('../common/permissions');

let Chap = require('../models/chap');
let Para = require('../models/para');


async function search(req, res, next) {

    //TODO: cache
    let {bookIds, chapIds} = evaluateUserContents(req.user);

    let word = req.params.word;
    let filter = {$text: {$search: word, $language: 'en'}};

    if (bookIds.length > 0 || chapIds.length > 0) {
        if (chapIds.length === 0) {
            filter.bookId = {$in: bookIds};
        } else if (bookIds.length === 0) {
            filter.chapId = {$in: chapIds};
        } else {
            filter['$or'] = [
                {bookId: {$in: bookIds}},
                {chapId: {$in: chapIds}}
            ];
        }
    }
    // console.log(JSON.stringify(filter, null, 2));

    let limit = getLimit(req, 8, 20);
    let paras = await Para.coll()
        .find(filter)
        .limit(limit)
        .toArray();

    return res.json(paras);
}

async function getPara(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json(null);
    }
    const para = await Para.getById(req.params._id);
    if (!para) {
        return res.json(null);
    }

    const chap = await Chap.getById(para.chapId);
    let hasPermission = await canReadChap(req.user, chap);
    if (!hasPermission) {
        return res.json(null);
    }

    return res.json(para);
}

router.get('/search/:word', wrapAsyncOne(search));
router.get('/:_id', wrapAsyncOne(getPara));

module.exports = router;
