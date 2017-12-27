let express = require('express');
let router = express.Router();

const {ObjectID} = require('mongodb');
let {wrapAsyncOne, currentUserId} = require('../common/helper');

let Book = require('../models/book');
let UserBook = require('../models/user_book');
let Chap = require('../models/chap');


function allBooks(req, res, next) {
    Book.coll().find()
        .sort({no: 1})
        .project({no: 0})
        .toArray()
        .then(bs => res.send(bs))
        .catch(next);
}

function bookDetail(req, res, next) {
    const bookId = req.params._id;
    const bp = Book.getById(bookId);
    const cp = Chap.coll()
        .find({bookId})
        .project({bookId: 0})
        .sort({no: 1})
        .toArray();
    Promise.all([bp, cp])
        .then(function ([book, chaps]) {
            book.chaps = chaps;
            res.send(book);
        }).catch(next);
}

function allChaps(req, res, next) {
    let bookId = req.params._id;
    Chap.find({bookId}, {bookId: 0})
        .then(cs => res.send(cs))
        .catch(next);
}

/* ************* */


async function myBooks(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        res.send([]);
        return;
    }

    let userBooks = await UserBook.find({userId}, {userId: 0, chaps: 0});
    if (userBooks.length === 0) {
        res.send([]);
        return;
    }
    let bookIds = userBooks.map(ub => ObjectID(ub.bookId));
    let books = await Book.find({_id: {$in: bookIds}});
    for (let ub of userBooks) {
        ub.book = books.find(b => b._id.toString() === ub.bookId);
        if (ub.book) {
            delete ub.bookId;
        }
    }
    res.send(userBooks);
}


async function myChaps(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.send([]);
    }
    let bookId = req.params._id;
    let userBook = await UserBook.coll()
        .findOne({userId, bookId}, {userId: 0, bookId: 0});
    if (!userBook) {
        return res.send([]);
    }
    let userChaps = userBook.chaps;
    if (!userChaps || userChaps.length === 0) {
        return res.send([]);
    }

    let chapIds = userChaps.map(uc => ObjectID(uc.chapId));
    let chaps = await Chap.find({_id: {$in: chapIds}});
    let chapsMap = new Map();
    for (let chap of chaps) {
        chapsMap.set(chap._id, chap);
    }
    for (let uc of userChaps) {
        uc.chap = chapsMap.get(uc.chapId);
    }
    res.send(userChaps);
}


router.get('/', allBooks);
router.get('/my_books', wrapAsyncOne(myBooks));
router.get('/:_id', bookDetail);
router.get('/:_id/chaps', allChaps);
router.get('/:_id/my_chaps', wrapAsyncOne(myChaps));

module.exports = router;
