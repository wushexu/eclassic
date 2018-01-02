let express = require('express');
let router = express.Router();

let {getLimit, wrapAsyncOne, currentUserId, checkChapterPermission} = require('../common/helper');

let UserBook = require('../models/user_book');
let Chap = require('../models/chap');
let Para = require('../models/para');


async function search(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json([]);
    }
    let word = req.params.word;
    let filter = {$text: {$search: word, $language: 'en'}};

    let userBooks = await UserBook.find({userId}, {userId: 0});
    let bookIds = [];
    let chapIds = [];
    for (let ub of userBooks) {
        if (ub.isAllChaps) {
            bookIds.push(ub.bookId);
        } else if (ub.chaps) {
            for (let cp of ub.chaps) {
                chapIds.push(cp.chapId);
            }
        }
    }

    if (bookIds.length > 0 || chapIds.length > 0) {
        if (chapIds.length === 0) {
            filter.bookId = {$in: bookIds};
        } else if (bookIds.length === 0) {
            filter.chapId = {$in: chapIds};
        } else {
            filter['$or'] = [{bookId: {$in: bookIds}}, {chapId: {$in: chapIds}}];
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
    let userId = currentUserId(req);
    if (!userId) {
        return res.json(null);
    }
    const para = await Para.getById(req.params._id);
    if (!para) {
        return res.json(null);
    }

    let userBook = await UserBook.coll()
        .findOne({userId, bookId: para.bookId}, {userId: 0, bookId: 0});
    if (!checkChapterPermission(userBook, para.chapId)) {
        return res.json(null);
    }
    return res.json(para);

}

router.get('/search/:word', wrapAsyncOne(search));
router.get('/:_id', wrapAsyncOne(getPara));

module.exports = router;
