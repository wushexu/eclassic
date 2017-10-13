let express = require('express');
let router = express.Router();

let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
let Chap = require('../models/chap');
let Para = require('../models/para');

let handles = restful.simpleHandles(Para);

let {show, update, destroy} = handles;


router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

let actions=sorter.sortable(Para,'chapId');
sorter.sort(router,actions);

module.exports = router;
