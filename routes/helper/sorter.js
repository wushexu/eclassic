let {extractFields, sendError, sendMgResult} = require('../../helper/helper');

function maxNo(Model, filter) {
    return Model.coll()
        .findOne(filter, {
            fields: {no: 1},
            sort: {no: -1}
        }).then(
            function (last) {
                let max = 1000;
                if (last && last.no) {
                    max = last.no;
                }
                return new Promise(function (resolve, reject) {
                    resolve(max);
                });
            },
            console.err);
}

function minNo(Model, filter) {
    return Model.coll()
        .findOne(filter, {
            fields: {no: 1},
            sort: {no: 1}
        }).then(
            function (first) {
                let min = 1000;
                if (first && first.no) {
                    min = first.no;
                }
                return new Promise(function (resolve, reject) {
                    resolve(min);
                });
            },
            console.err);
}


function sortable(Model, scopeField) {

    function scope(m) {
        let s = {};
        if (scopeField) {
            s[scopeField] = m[scopeField];
        }
        return s;
    }


    function updateNo(id, no, res, eh) {
        Model.update(id, {no}).then(
            sendMgResult(res),
            eh).catch(eh);
    }

    function swapNo(m1, m2) {
        return Model.coll().bulkWrite([
            {updateOne: {filter: {_id: m1._id}, update: {$set: {no: m2.no}}}},
            {updateOne: {filter: {_id: m2._id}, update: {$set: {no: m1.no}}}}
        ]);
    }

    // *************

    function moveUp(req, res, next) {
        let eh = sendError(req, res);

        Model.getById(req.params._id).then(function (m) {
            let filter = scope(m);
            filter.no = {$lt: m.no};
            Model.coll().findOne(filter, {
                fields: {no: 1},
                sort: {no: -1}
            }).then(function (adjacent) {
                if (adjacent) {
                    swapNo(m, adjacent).then(
                        sendMgResult(res),
                        eh).catch(eh);
                } else {
                    res.send({ok: 1});
                }
            }, eh).catch(eh);
        }, eh).catch(eh);
    }

    function moveDown(req, res, next) {
        let eh = sendError(req, res);

        Model.getById(req.params._id).then(function (m) {
            let filter = scope(m);
            filter.no = {$gt: m.no};
            Model.coll().findOne(filter, {
                fields: {no: 1},
                sort: {no: 1}
            }).then(function (adjacent) {
                if (adjacent) {
                    swapNo(m, adjacent).then(
                        sendMgResult(res),
                        eh).catch(eh);
                } else {
                    res.send({ok: 1});
                }
            }, eh).catch(eh);
        }, eh).catch(eh);
    }

    function moveTop(req, res, next) {
        let eh = sendError(req, res);

        Model.getById(req.params._id).then(function (m) {
            let filter = scope(m);
            minNo(Model, filter)
                .then(function (no) {
                    // if (m.no === no) {
                    //     res.send({ok: 1});
                    //     return;
                    // }
                    updateNo(m._id, no - 10, res, eh);
                }, eh).catch(eh);
        }, eh).catch(eh);
    }

    function moveBottom(req, res, next) {
        let eh = sendError(req, res);

        Model.getById(req.params._id).then(function (m) {
            let filter = scope(m);
            maxNo(Model, filter)
                .then(function (no) {
                    // if (m.no === no) {
                    //     res.send({ok: 1});
                    //     return;
                    // }
                    updateNo(m._id, no + 10, res, eh);
                }, eh).catch(eh);
        }, eh).catch(eh);
    }

    function thenCreateModel(nm, res, eh) {
        return function (r) {
            if (r && r.result && r.result.ok === 1) {
                Model.create(nm).then(
                    (r) => {
                        res.send(nm);
                    },
                    eh).catch(eh);
            } else {
                res.send({ok: 0});
            }
        };
    }

    function createBefore(req, res, next) {
        let eh = sendError(req, res);
        let nm = extractFields(req, Model.fields.createFields);

        Model.getById(req.params._id).then(function (target) {
            if (scopeField) {
                nm[scopeField] = target[scopeField];
            }
            nm.no = target.no;

            let filter = scope(target);
            filter.no = {$gte: target.no};
            Model.coll().updateMany(
                filter,
                {$inc: {no: 10}})
                .then(
                    thenCreateModel(nm, res, eh),
                    eh).catch(eh);
        }, eh).catch(eh);
    }

    function createAfter(req, res, next) {
        let eh = sendError(req, res);
        let nm = extractFields(req, Model.fields.createFields);

        Model.getById(req.params._id).then(function (target) {
            if (scopeField) {
                nm[scopeField] = target[scopeField];
            }
            nm.no = target.no + 10;

            let filter = scope(target);
            filter.no = {$gt: target.no};
            Model.coll().updateMany(
                filter,
                {$inc: {no: 10}})
                .then(
                    thenCreateModel(nm, res, eh),
                    eh).catch(eh);
        }, eh).catch(eh);
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


module.exports = {maxNo, sortable, sort};
