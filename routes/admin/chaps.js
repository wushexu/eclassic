let express = require('express');
let router = express.Router();

let {readModels} = require('../../common/helper');
let restful = require('./common/rest');
let sorter = require('./common/sorter');
let Chap = require('../../models/chap');
let Para = require('../../models/para');

let handles = restful.simpleHandles(Chap,
    {
        ChildModel: Para,
        parentFieldInChild: 'chapId',
        childExistsMsg: 'Has Content'
    });

let {show, update, destroy} = handles;


router.param('_id', function (req, res, next, _id) {
    req.params.chapId = _id;
    next();
});

async function createParas(req, res, next) {

    let models = readModels(req, Para.fields.createFields);

    const chapId = req.params.chapId;
    let no = await sorter.maxNo(Para, {chapId});
    no += sorter.sequenceInterval;

    let promises = models.map(m => {
        m.no = no;
        no += sorter.sequenceInterval;
        m.chapId = chapId;
        return Para.create(m);
    });

    Promise.all(promises)
        .then(_ => res.json(models))
        .catch(next);
}

let {list: listParas, create: createPara} = sorter.childResource(Para, 'chapId');


router.route('/:_id/paras')
    .get(listParas)
    .post(createPara)
    .put(createParas);

router.get('/:_id/detail', function (req, res, next) {

    const chapId = req.params.chapId;
    const cp = Chap.getById(chapId);
    const pp = Para.coll()
        .find({chapId})
        .project({content: 1, trans: 1})
        .sort({no: 1})
        .toArray();
    Promise.all([cp, pp])
        .then(function ([chap, paras]) {
            chap.paras = paras;
            res.json(chap);
        }).catch(next);
});

router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

let actions = sorter.sortable(Chap, 'bookId');
sorter.sort(router, actions);

module.exports = router;
