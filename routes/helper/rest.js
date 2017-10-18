const {extractFields, sendMgResult} = require('../../helper/helper');
const validate = require('../../middleware/validate');

function simpleHandles(Model) {

    let {requiredFields, updateFields, createFields} = Model.fields;

    let sortable = createFields.indexOf('no') >= 0;

    async function index(req, res, next) {

        let p = Model.coll().find();
        if (sortable) {
            p = p.sort({no: 1});
        }
        let ms=await p.toArray();
        res.send(ms);
    }

    async function create(req, res, next) {
        let m = extractFields(req, createFields);
        await Model.create(m);
        res.send(m);
    }

    async function show(req, res, next) {
        let _id = req.params._id;
        let m=await Model.getById(_id);
        res.send(m);
    }

    async function update(req, res, next) {
        let m = extractFields(req, updateFields);
        let r=await Model.update(req.params._id, m);
        sendMgResult(res,r);
    }

    async function destroy(req, res, next) {
        let r=await Model.remove(req.params._id);
        sendMgResult(res,r);
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
