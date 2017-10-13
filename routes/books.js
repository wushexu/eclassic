let express = require('express');
let router = express.Router();

let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
let Book = require('../models/book');
let Chap = require('../models/chap');

let handles = restful.simpleHandles(Book);


restful.restful(router, handles);

router.param('_id', function (req, res, next, _id) {
    req.params.bookId = _id;
    next();
});


let {list: listChaps, create: createChap} = sorter.childResource(Chap,'bookId');

router.route('/:_id/chaps')
    .get(listChaps)
    .post(createChap);

let actions = sorter.sortable(Book);
sorter.sort(router, actions);

module.exports = router;
