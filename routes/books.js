let express = require('express');
let router = express.Router();

const {ObjectID} = require('mongodb');
let {wrapAsyncOne} = require('../common/helper');

let Book = require('../models/book');
let UserBook = require('../models/user-book');


function allBooks(req, res, next) {
    Book.coll().find()
        .sort({no: 1})
        .project({no: 0})
        .toArray()
        .then(bs => res.send(bs))
        .catch(next);
}

async function myBooks(req, res, next) {
    let user = req.user;
    if (!user) {
        res.send([]);
        return;
    }

    let uid = user._id;
    if (typeof uid === 'object') {
        //ObjectID
        uid = uid.toHexString();
    }

    let userBooks = await UserBook.find({userId: uid}, {userId: 0, chaps: 0});
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


router.get('/', wrapAsyncOne(myBooks));
router.get('/all', allBooks);

module.exports = router;
