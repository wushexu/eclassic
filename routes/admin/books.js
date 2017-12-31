let express = require('express');
let router = express.Router();

let {sendError} = require('../../common/helper');
let restful = require('./common/rest');
let sorter = require('./common/sorter');
let Book = require('../../models/book');
let Chap = require('../../models/chap');

let handles = restful.simpleHandles(Book,
    {
        ChildModel: Chap,
        parentFieldInChild: 'bookId',
        childExistsMsg: 'Chapter Exists'
    });


restful.restful(router, handles);

router.param('_id', function (req, res, next, _id) {
    req.params.bookId = _id;
    next();
});


let {list: listChaps, create: createChap} = sorter.childResource(Chap, 'bookId');

router.route('/:_id/chaps')
    .get(listChaps)
    .post(createChap);

router.get('/:_id/detail', function (req, res, next) {
    const bookId = req.params.bookId;
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
});

let actions = sorter.sortable(Book);
sorter.sort(router, actions);

module.exports = router;