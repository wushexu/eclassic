let express = require('express');
let router = express.Router();

let {wrapAsyncOne, currentUserId} = require('../common/helper');

let UserBook = require('../models/user_book');
let Chap = require('../models/chap');
let Para = require('../models/para');

function checkChapterPermission(userBook, chapId) {
    if (!userBook) {
        return false;
    }
    let userChaps = userBook.chaps;
    if (!userChaps || userChaps.length === 0) {
        return false;
    }
    return userChaps.find(uc => uc.chapId === chapId);
}

async function chapContent(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.send({});
    }

    const chapId = req.params._id;
    const chap = await Chap.getById(chapId);
    if (!chap) {
        return res.send({});
    }

    // check permission
    let userBook = await UserBook.coll()
        .findOne({userId, bookId: chap.bookId}, {userId: 0, bookId: 0});
    if (!checkChapterPermission(userBook, chapId)) {
        return res.send({});
    }

    chap.paras = await Para.coll()
        .find({chapId})
        .project({chapId: 0, no: 0})
        .sort({no: 1}).toArray();

    res.send(chap);
}


router.get('/:_id', wrapAsyncOne(chapContent));

module.exports = router;
