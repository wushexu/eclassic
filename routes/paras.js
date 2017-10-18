let express = require('express');
let router = express.Router();

let {sendMgResult} = require('../helper/helper');
let restful = require('./helper/rest');
let sorter = require('./helper/sorter');
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

    let {content, trans} = target;
    content = content + LF + source.content;
    target.content = content;
    if (trans || source.trans) {
        if (!trans) {
            trans = source.trans;
        } else if (source.trans) {
            trans = trans + LF + source.trans;
        }
        target.trans = trans;
    }

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

    let {content, trans} = target;
    content = source.content + LF + content;
    target.content = content;
    if (trans || source.trans) {
        if (!trans) {
            trans = source.trans;
        } else if (source.trans) {
            trans = source.trans + LF + trans;
        }
        target.trans = trans;
    }

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
