let {extractFields, sendMgResult} = require('../../helper/helper');

const sequenceInterval = 10;
const sequenceSeed = 1000;

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
            res.send({ok: 0});
        }
    }

    function moveUp(req, res, next) {

        moveUpOrDown(req, res, 'up');
    }

    async function moveDown(req, res, next) {

        moveUpOrDown(req, res, 'down');
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

        moveTopOrBottom(req, res, 'top');
    }

    function moveBottom(req, res, next) {

        moveTopOrBottom(req, res, 'bottom');
    }

    async function createBeforeOrAfter(req, res, dir) {

        let nm = extractFields(req, Model.fields.createFields);

        let target = await Model.getById(req.params._id);
        if (scopeField) {
            nm[scopeField] = target[scopeField];
        }
        nm.no = target.no;
        if (dir === 'after') {
            nm.no += sequenceInterval;
        }

        let filter = scope(target);
        let cmp = (dir === 'before') ? '$gte' : '$gt';
        filter.no = {[cmp]: target.no};
        let r = await Model.coll().updateMany(
            filter,
            {$inc: {no: sequenceInterval}});

        if (r && r.result && r.result.ok === 1) {
            let cr = await Model.create(nm);
            res.send(cr);
        } else {
            res.send({ok: 0});
        }
    }

    function createBefore(req, res, next) {

        createBeforeOrAfter(req, res, 'before');
    }

    function createAfter(req, res, next) {

        createBeforeOrAfter(req, res, 'after');
    }

    return {
        swapOrder,
        moveUp, moveDown,
        moveTop, moveBottom,
        createBefore, createAfter
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
}


function childResource(ChildModel, scopeField) {

    async function list(req, res, next) {

        let ms = await ChildModel.coll()
            .find({[scopeField]: req.params._id})
            .sort({no: 1})
            .toArray();
        res.send(ms);
    }

    async function create(req, res, next) {

        let m = extractFields(req, ChildModel.fields.createFields);

        let no = await maxNo(ChildModel, {[scopeField]: m[scopeField]});
        m.no = no + sequenceInterval;
        let r = await ChildModel.create(m);
        res.send(m);
    }

    return {list, create};
}


module.exports = {maxNo, sequenceInterval, sortable, sort, childResource};
