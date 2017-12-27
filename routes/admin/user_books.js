let express = require('express');
let router = express.Router();

let {sendMgResult} = require('../../common/helper');
let restful = require('./common/rest');


let UserBook = require('../../models/user_book');


let handles = restful.simpleHandles(UserBook);
let {show, update, create, destroy} = handles;

router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

router.post('/', create);

router.get('/', (req, res, next) => res.json([]));


module.exports = router;
