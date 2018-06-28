let express = require('express');
let router = express.Router();

let {wrapAsync,modelIdString} = require('../common/helper');
let UserBook = require('../models/user_book');

async function myBooks(req, res, withChaps) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json([]);
    }
    let project = {userId: 0};
    if(!withChaps){
        project.chaps = 0;
    }
    let userBooks = await UserBook
        .find({userId}, project);

    res.json(userBooks);
}

async function myBooksWithoutChaps(req, res, next) {
    await myBooks(req, res, false);
}

async function myBookWithChaps(req, res, next) {
    await myBooks(req, res, true);
}


async function myBookChaps(req, res, next) {
    const bookId = req.params.bookId;

    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json(null);
    }
    let userBook = await UserBook.coll()
        .findOne({userId, bookId}, {userId: 0});
    res.json(userBook);
}

router.get('/', wrapAsync(myBooksWithoutChaps));
router.get('/withChaps', wrapAsync(myBookWithChaps));
router.get('/:bookId', wrapAsync(myBookChaps));

module.exports = router;
