let express = require('express');
let router = express.Router();

let {wrapAsyncOne, currentUserId} = require('../common/helper');

let Book = require('../models/book');
let UserBook = require('../models/user_book');
let Chap = require('../models/chap');


async function allBooks(req, res, next) {
    let books = await Book.coll().find()
        .sort({no: 1})
        .project({no: 0})
        .toArray();

    let userId = currentUserId(req);
    if (!userId) {
        return res.json(books);
    }
    let userBooks = await UserBook
        .find({userId}, {userId: 0, chaps: 0});
    for (let ub of userBooks) {
        let book = books.find(b => b._id.toString() === ub.bookId);
        if (book) {
            book.userBook = ub;
        }
    }

    res.json(books);
}

function getBook(req, res, next) {
    Book.getById(req.params._id)
        .then(book => res.json(book))
        .catch(next);
}

async function bookDetail(req, res, next) {
    const bookId = req.params._id;
    const bp = Book.getById(bookId);
    const cp = Chap.coll()
        .find({bookId})
        .project({bookId: 0})
        .sort({no: 1})
        .toArray();
    let [book, chaps] = await Promise.all([bp, cp]);
    if (!book) {
        return res.json(null);
    }
    book.chaps = chaps;

    let userId = currentUserId(req);
    if (!userId) {
        return res.json(book);
    }
    let userBook = await UserBook.coll()
        .findOne({userId, bookId}, {userId: 0});
    book.userBook = userBook;
    res.json(book);
}


router.get('/', wrapAsyncOne(allBooks));
router.get('/:_id', getBook);
router.get('/:_id/detail', wrapAsyncOne(bookDetail));

module.exports = router;
