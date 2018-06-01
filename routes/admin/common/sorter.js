let {extractFields, readModels, sendMgResult, wrapAsyncs} = require('../../../common/helper');

const sequenceInterval = 1024;
const sequenceSeed = 10000;

async function maxNo(Model, filter) {
    let last = await Model.coll()
        .findOne(filter, {
            fields: {no: 1},
            sort: {no: -1}
        });
    let max = sequenceSeed;
    if (last && last.no) {
        max = last.no;
    }
    return max;
}

async function minNo(Model, filter) {
    let first = await Model.coll()
        .findOne(filter, {
            fields: {no: 1},
            sort: {no: 1}
        });
    let min = sequenceSeed;
    if (first && first.no) {
        min = first.no;
    }
    return min;
}


function sortable(Model, scopeField) {

    function scope(m) {
        let s = {};
        if (scopeField) {
            s[scopeField] = m[scopeField];
        }
        return s;
    }

    function swapNo(m1, m2) {
        return Model.coll().bulkWrite([
            {updateOne: {filter: {_id: m1._id}, update: {$set: {no: m2.no}}}},
            {updateOne: {filter: {_id: m2._id}, update: {$set: {no: m1.no}}}}
        ]);
    }

    // *************

    async function swapOrder(req, res, next) {
        let [m1, m2] = await Promise.all(
            [
                Model.getById(req.params._id, {no: 1}),
                Model.getById(req.params.otherId, {no: 1})
            ]);

        let r = await swapNo(m1, m2);
        sendMgResult(res, r);
    }

    async function moveUpOrDown(req, res, dir) {

        let m = await Model.getById(req.params._id);
        let filter = scope(m);
        let cmp = (dir === 'up') ? '$lt' : '$gt';
        filter.no = {[cmp]: m.no};
        let sort = {no: (dir === 'up') ? -1 : 1};
        let adjacent = await Model.coll().findOne(filter, {
            fields: {no: 1},
            sort: sort
        });
        if (adjacent) {
            let r = await swapNo(m, adjacent);
            sendMgResult(res, r);
        } else {
            res.json({ok: 0});
        }
    }

    function moveUp(req, res, next) {

        moveUpOrDown(req, res, 'up').catch(next);
    }

    function moveDown(req, res, next) {

        moveUpOrDown(req, res, 'down').catch(next);
    }

    async function moveTopOrBottom(req, res, dir) {

        let m = await Model.getById(req.params._id);
        let filter = scope(m);
        let no;
        if (dir === 'top') {
            no = await minNo(Model, filter);
        } else {
            no = await maxNo(Model, filter);
        }
        if (dir === 'top') {
            no -= sequenceInterval;
        } else {
            no += sequenceInterval;
        }
        let r = await Model.update(m._id, {no});
        sendMgResult(res, r);
    }

    function moveTop(req, res, next) {

        moveTopOrBottom(req, res, 'top').catch(next);
    }

    function moveBottom(req, res, next) {

        moveTopOrBottom(req, res, 'bottom').catch(next);
    }

    async function createSeqSpace(target, dir, count = 1) {

        let filter = scope(target);
        let seqs = [];

        let cmp = (dir === 'before') ? '$lt' : '$gt';
        filter.no = {[cmp]: target.no};
        let adjacent = await Model.coll()
            .findOne(filter, {
                fields: {no: 1},
                sort: {no: (dir === 'before') ? -1 : 1}
            });

        if (adjacent) {
            let lower = (dir === 'before') ? adjacent.no : target.no;
            let higher = (dir === 'after') ? adjacent.no : target.no;
            let space = higher - lower;
            let seqInterval = 1;
            if (space > count) {
                if (space > count * 8) {
                    seqInterval = 8;
                }

                let seq = lower + seqInterval;
                for (let i = 0; i < count; i++) {
                    seqs.push(seq);
                    seq += seqInterval;
                }
                return seqs;
            }
        }

        cmp = (dir === 'before') ? '$gte' : '$gt';
        filter.no = {[cmp]: target.no};
        let r = await Model.coll().updateMany(
            filter,
            {$inc: {no: sequenceInterval * count}});
        if (!r.result || r.result.ok !== 1) {
            return null;
        }
        let seq = target.no;
        if (dir === 'after') {
            seq += sequenceInterval;
        }
        for (let i = 0; i < count; i++) {
            seqs.push(seq);
            seq += sequenceInterval;
        }
        return seqs;
    }

    async function createBeforeOrAfter(req, res, dir) {

        let nm = extractFields(req, Model.fields.createFields);

        let target = await Model.getById(req.params._id);

        let seqs = await createSeqSpace(target, dir);
        if (!seqs) {
            res.json({ok: 0});
            return;
        }
        nm.no = seqs[0];

        if (scopeField) {
            nm[scopeField] = target[scopeField];
        }
        await Model.create(nm);
        res.json(nm);
    }

    function createBefore(req, res, next) {

        createBeforeOrAfter(req, res, 'before').catch(next);
    }

    function createAfter(req, res, next) {

        createBeforeOrAfter(req, res, 'after').catch(next);
    }

    async function createManyBeforeOrAfter(req, res, next, dir) {

        let models = readModels(req, Model.fields.createFields);
        let target = await Model.getById(req.params._id);

        let seqs = await createSeqSpace(target, dir, models.length);
        if (!seqs) {
            res.json([]);
            return;
        }

        let promises = models.map((nm, index) => {
            if (scopeField) {
                nm[scopeField] = target[scopeField];
            }
            console.log(index, seqs[index]);
            nm.no = seqs[index];
            return Model.create(nm);
        });

        Promise.all(promises)
            .then(_ => res.json(models))
            .catch(next);
    }

    function createManyBefore(req, res, next) {

        createManyBeforeOrAfter(req, res, next, 'before').catch(next);
    }

    function createManyAfter(req, res, next) {

        createManyBeforeOrAfter(req, res, next, 'after').catch(next);
    }

    [swapOrder] = wrapAsyncs(swapOrder);

    return {
        swapOrder,
        moveUp, moveDown,
        moveTop, moveBottom,
        createBefore, createAfter,
        createManyBefore, createManyAfter
    };
}

function sort(router, actions) {

    router.post('/:_id/swapOrder/:otherId', actions.swapOrder);
    router.post('/:_id/moveUp', actions.moveUp);
    router.post('/:_id/moveDown', actions.moveDown);
    router.post('/:_id/moveTop', actions.moveTop);
    router.post('/:_id/moveBottom', actions.moveBottom);
    router.post('/:_id/createBefore', actions.createBefore);
    router.post('/:_id/createAfter', actions.createAfter);
    router.post('/:_id/createManyBefore', actions.createManyBefore);
    router.post('/:_id/createManyAfter', actions.createManyAfter);
}


function childResource(ChildModel, scopeField) {

    async function list(req, res, next) {

        let ms = await ChildModel.coll()
            .find({[scopeField]: req.params._id})
            .sort({no: 1})
            .project({no: 0})
            .toArray();
        res.json(ms);
    }

    async function create(req, res, next) {

        let m = extractFields(req, ChildModel.fields.createFields);

        let no = await maxNo(ChildModel, {[scopeField]: m[scopeField]});
        m.no = no + sequenceInterval;
        let r = await ChildModel.create(m);
        res.json(m);
    }

    return {list, create};
}


module.exports = {maxNo, sequenceInterval, sortable, sort, childResource};
