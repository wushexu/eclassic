let express = require('express');
let router = express.Router();

let {sendMgResult} = require('../common/helper');
let restful = require('./common/rest');
let sorter = require('./common/sorter');
let Para = require('../models/para');

const LF = '\n';

async function saveMerging(source, target, res) {

    let r = await Para.coll().bulkWrite([
        {
            updateOne: {
                filter: {_id: target._id},
                update: {$set: {content: target.content, trans: target.trans}}
            }
        },
        {deleteOne: {filter: {_id: source._id}}}
    ]);
    sendMgResult(res, r);
}

function mergeContent(p1, p2, target) {
    let {content: content1, trans: trans1} = p1;
    let {content: content2, trans: trans2} = p2;
    let content = content1 + LF + content2;
    let trans;
    if (trans1 || trans2) {
        if (!trans1) {
            trans = trans2;
        } else if (trans2) {
            trans = trans1 + LF + trans2;
        }
    }
    target.content = content;
    target.trans = trans;
}

async function mergeUp(req, res, next) {

    let source = await Para.getById(req.params._id);
    if (!source) {
        res.send({ok: 0});
        return;
    }
    let target = await Para.coll()
        .findOne({
            chapId: source.chapId,
            no: {$lt: source.no}
        }, {
            sort: {no: -1}
        });
    if (!target) {
        res.send({ok: 0});
        return;
    }

    mergeContent(target, source, target);

    saveMerging(source, target, res);
}

async function mergeDown(req, res, next) {

    let source = await Para.getById(req.params._id);
    if (!source) {
        res.send({ok: 0});
        return;
    }
    let target = await Para.coll()
        .findOne({
            chapId: source.chapId,
            no: {$gt: source.no}
        }, {
            sort: {no: 1}
        });
    if (!target) {
        res.send({ok: 0});
        return;
    }

    mergeContent(source, target, target);

    saveMerging(source, target, res);
}


let handles = restful.simpleHandles(Para);

let {show, update, destroy} = handles;

router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

let actions = sorter.sortable(Para, 'chapId');
sorter.sort(router, actions);


router.post('/:_id/mergeUp', mergeUp);
router.post('/:_id/mergeDown', mergeDown);

module.exports = router;
