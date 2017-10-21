let express = require('express');
let router = express.Router();

let {sendError} = require('../helper/helper');
let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
let Chap = require('../models/chap');
let Para = require('../models/para');

let handles = restful.simpleHandles(Chap,
    {
        ChildModel: Para,
        parentFieldInChild: 'chapId',
        childExistsMsg: 'Para Exists'
    });

let {show, update, destroy} = handles;


router.param('_id', function (req, res, next, _id) {
    req.params.chapId = _id;
    next();
});


let {list: listParas, create: createPara} = sorter.childResource(Para, 'chapId');

router.route('/:_id/paras')
    .get(listParas)
    .post(createPara);

router.get('/:_id/detail', function (req, res, next) {

    const cid = req.params.chapId;
    const cp = Chap.getById(cid);
    const pp = Para.coll()
        .find({chapId: cid})
        .project({chapId: 0})
        .sort({no: 1})
        .toArray();
    Promise.all([cp, pp])
        .then(function ([chap, paras]) {
            chap.paras = paras;
            res.send(chap);
        }).catch(sendError(req, res))
});

router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

let actions = sorter.sortable(Chap, 'bookId');
sorter.sort(router, actions);

module.exports = router;
