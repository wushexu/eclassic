let express = require('express');
let router = express.Router();

let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
let Chap = require('../models/chap');

let handles = restful.simpleHandles(Chap);

let {show, update, destroy} = handles;


router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

let actions=sorter.sortable(Chap,'bookId');
sorter.sort(router,actions);

module.exports = router;
