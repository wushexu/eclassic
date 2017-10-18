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

    async function moveUp(req, res, next) {

        let m = await Model.getById(req.params._id);
        let filter = scope(m);
        filter.no = {$lt: m.no};
        let adjacent = await Model.coll().findOne(filter, {
            fields: {no: 1},
            sort: {no: -1}
        });
        if (adjacent) {
            let r = await swapNo(m, adjacent);
            sendMgResult(res, r);
        } else {
            res.send({ok: 0});
        }
    }

    async function moveDown(req, res, next) {

        let m = Model.getById(req.params._id);
        let filter = scope(m);
        filter.no = {$gt: m.no};
        let adjacent = await Model.coll().findOne(filter, {
            fields: {no: 1},
            sort: {no: 1}
        });
        if (adjacent) {
            let r = await swapNo(m, adjacent);
            sendMgResult(res, r);
        } else {
            res.send({ok: 0});
        }
    }

    async function moveTop(req, res, next) {

        let m = await Model.getById(req.params._id);
        let filter = scope(m);
        let no = minNo(Model, filter);
        no -= sequenceInterval;
        let r = await Model.update(m._id, {no});
        sendMgResult(res, r);
    }

    async function moveBottom(req, res, next) {

        let m = await Model.getById(req.params._id);
        let filter = scope(m);
        let no = maxNo(Model, filter);
        no += sequenceInterval;
        let r = await Model.update(m._id, {no});
        sendMgResult(res, r);
    }

    async function createBefore(req, res, next) {
        let nm = extractFields(req, Model.fields.createFields);

        let target = await Model.getById(req.params._id);
        if (scopeField) {
            nm[scopeField] = target[scopeField];
        }
        nm.no = target.no;

        let filter = scope(target);
        filter.no = {$gte: target.no};
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

    async function createAfter(req, res, next) {
        let nm = extractFields(req, Model.fields.createFields);

        let target = await Model.getById(req.params._id);
        if (scopeField) {
            nm[scopeField] = target[scopeField];
        }
        nm.no = target.no + sequenceInterval;

        let filter = scope(target);
        filter.no = {$gt: target.no};
        let r = await  Model.coll().updateMany(
            filter,
            {$inc: {no: sequenceInterval}});

        if (r && r.result && r.result.ok === 1) {
            let cr = await Model.create(nm);
            res.send(cr);
        } else {
            res.send({ok: 0});
        }
    }

    return {
        moveUp, moveDown,
        moveTop, moveBottom,
        createBefore, createAfter
    };
}

function sort(router, actions) {

    for (let name in actions) {
        router.post('/:_id/' + name, actions[name]);
    }
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


module.exports = {maxNo, sortable, sort, childResource};
