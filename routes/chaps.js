let express = require('express');
let router = express.Router();

let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
let Chap = require('../models/chap');
let Para = require('../models/para');

let handles = restful.simpleHandles(Chap);

let {show, update, destroy} = handles;


router.param('_id', function (req, res, next, _id) {
    req.params.chapId = _id;
    next();
});


let {list: listParas, create: createPara} = sorter.childResource(Para, 'chapId');

router.route('/:_id/paras')
    .get(listParas)
    .post(createPara);

router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

let actions = sorter.sortable(Chap, 'bookId');
sorter.sort(router, actions);

module.exports = router;
