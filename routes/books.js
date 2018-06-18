let express = require('express');
let router = express.Router();

let {wrapAsync, modelIdString} = require('../common/helper');

let Book = require('../models/book');
let Chap = require('../models/chap');
let UserBook = require('../models/user_book');
let {adminOrEditor} = require('../models/user');


async function allBooks(req, res, next) {
    let books = await Book.coll()
        .find({status: 'R'})
        .sort({no: 1})
        .project({no: 0, status: 0})
        .toArray();

    let user = req.user;
    if (adminOrEditor(user)) {
        for (let book of books) {
            delete book.visibility;
        }
        return res.json(books);
    }

    let nonPublic = books.find(book => book.visibility !== 'P');
    if (!nonPublic) {
        for (let book of books) {
            delete book.visibility;
        }
        return res.json(books);
    }

    let userId = modelIdString(user);
    let userBooks = await UserBook
        .find({userId, role: {$in: [UserBook.Roles.Owner, UserBook.Roles.Editor]}},
            {bookId: 1, role: 1});
    if (!userBooks) {
        userBooks = [];
    }

    books = books.filter(book => {
        if (book.visibility === 'P') {
            return true;
        }
        if (book.visibility === 'E') {
            let userBook = userBooks.find(ub => ub.bookId === book.id);
            return userBook && UserBook.ownerOrEditor(userBook);
        }
        return false;
    });

    for (let book of books) {
        delete book.visibility;
    }
    res.json(books);
}

function getBook(req, res, next) {
    Book.releasedBook(req.params._id)
        .then(book => res.json(book))
        .catch(next);
}

async function bookDetail(req, res, next) {
    const bookId = req.params._id;
    const bp = Book.releasedBook(bookId);
    const cp = Chap.coll()
        .find({bookId, status: 'R'})
        .project({bookId: 0, status: 0})
        .sort({no: 1})
        .toArray();
    let [book, chaps] = await Promise.all([bp, cp]);
    if (!book) {
        return res.json(null);
    }
    book.chaps = chaps;

    res.json(book);
}

async function chapVersions(req, res, next) {
    const bookId = req.params._id;
    const bp = Book.releasedBook(bookId);
    const cp = Chap.coll()
        .find({bookId, status: 'R'})
        .project({version: 1})
        .toArray();
    let [book, chaps] = await Promise.all([bp, cp]);
    if (!book) {
        return res.json(null);
    }

    res.json(chaps);
}


router.get('/', wrapAsync(allBooks));
router.get('/:_id', getBook);
router.get('/:_id/detail', wrapAsync(bookDetail));
router.get('/:_id/chapVersions', wrapAsync(chapVersions));

module.exports = router;
