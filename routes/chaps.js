let express = require('express');
let router = express.Router();

let {wrapAsyncOne, currentUserId} = require('../common/helper');

let UserBook = require('../models/user_book');
let Chap = require('../models/chap');
let Para = require('../models/para');


function getChap(req, res, next) {
    Chap.getById(req.params._id)
        .then(chap => res.json(chap))
        .catch(next);
}

function checkChapterPermission(userBook, chapId) {
    if (!userBook) {
        return false;
    }
    if (userBook.isAllChaps) {
        return true;
    }
    let userChaps = userBook.chaps;
    if (!userChaps || userChaps.length === 0) {
        return false;
    }
    return userChaps.find(uc => uc.chapId === chapId);
}

async function chapDetail(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json(null);
    }

    const chapId = req.params._id;
    const chap = await Chap.getById(chapId);
    if (!chap) {
        return res.json(null);
    }

    // check permission
    let userBook = await UserBook.coll()
        .findOne({userId, bookId: chap.bookId}, {userId: 0, bookId: 0});
    if (!checkChapterPermission(userBook, chapId)) {
        return res.json(chap);
    }

    chap.paras = await Para.coll()
        .find({chapId})
        .project({chapId: 0, no: 0, updatedAt: 0})
        .sort({no: 1}).toArray();

    res.json(chap);
}


router.get('/:_id', getChap);
router.get('/:_id/detail', wrapAsyncOne(chapDetail));

module.exports = router;
