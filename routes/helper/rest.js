const {extractFields, sendError, sendMgResult} = require('../../helper/helper');
const validate = require('../../middleware/validate');

function simpleHandles(Model) {

    let {requiredFields, updateFields, createFields} = Model.fields;

    let sortable = createFields.indexOf('no') >= 0;

    function index(req, res, next) {
        let eh = sendError(req, res);

        let p = Model.coll().find();
        if (sortable) {
            p = p.sort({no: 1});
        }
        p.toArray().then(
            res.send.bind(res),
            eh).catch(eh);
    }

    function create(req, res, next) {
        let eh = sendError(req, res);
        let m = extractFields(req, createFields);
        Model.create(m).then(
            (r) => {
                res.send(m);
            },
            eh).catch(eh);
    }

    function show(req, res, next) {
        let eh = sendError(req, res);
        let _id = req.params._id;
        Model.getById(_id).then(
            res.send.bind(res),
            eh).catch(eh);
    }

    function update(req, res, next) {
        let eh = sendError(req, res);
        let m = extractFields(req, updateFields);
        Model.update(req.params._id, m).then(
            sendMgResult(res),
            eh).catch(eh);
    }

    function destroy(req, res, next) {
        let eh = sendError(req, res);
        Model.remove(req.params._id).then(
            sendMgResult(res),
            eh).catch(eh);
    }

    if (requiredFields) {
        create = [validate.required(requiredFields), create];
    }

    return {index, create, show, update, destroy};
}

function restful(router, handles, basePath = '') {

    let {index, create, show, update, destroy} = handles;

    router.route(basePath + '/')
        .get(index)
        .post(create);

    router.route(basePath + '/:_id')
        .get(show)
        .put(update)
        .delete(destroy);
}


module.exports = {simpleHandles, restful};
