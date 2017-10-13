let express = require('express');
let router = express.Router();

let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
let Book = require('../models/book');
let Chap = require('../models/chap');
let {extractFields, sendError} = require('../helper/helper');

let handles = restful.simpleHandles(Book);


restful.restful(router, handles);

function listChaps(req, res, next) {
    let eh = sendError(req, res);

    Chap.coll().find({bookId: req.params._id})
        .sort({no: 1})
        .toArray()
        .then(
            res.send.bind(res),
            eh)
        .catch(eh);
}

function createChap(req, res, next) {
    let eh = sendError(req, res);

    let m = extractFields(req, Chap.fields.createFields);
    bookId = m.bookId;

    sorter.maxNo(Chap, {bookId}).then(function (no) {
        m.no = no + 10;
        Chap.create(m).then(
            (r) => {
                res.send(m);
            },
            eh).catch(eh);
    }, eh).catch(eh);
}

router.route('/:_id/chaps')
    .get(listChaps)
    .post(createChap);

let actions=sorter.sortable(Book);
sorter.sort(router,actions);

module.exports = router;

router.param('_id', function (req, res, next, _id) {
    req.params.bookId = _id;
    next();
});