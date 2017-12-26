const {extractFields, sendMgResult, wrapAsync} = require('../../../common/helper');
const validate = require('../../../middleware/validate');
const {maxNo, sequenceInterval} = require('./sorter');

function simpleHandles(Model, options = {}) {

    let {requiredFields, updateFields, createFields} = Model.fields;

    let sortable = createFields.indexOf('no') >= 0;

    let {ChildModel, parentFieldInChild, childExistsMsg} = options;

    async function index(req, res, next) {

        let p = Model.coll().find();
        if (sortable) {
            p = p.sort({no: 1}).project({no: 0});
        }
        let ms = await p.toArray();
        res.send(ms);
    }

    async function create(req, res, next) {
        let m = extractFields(req, createFields);

        if (sortable) {
            let no = await maxNo(Model, null);
            m.no = no + sequenceInterval;
        }

        await Model.create(m);
        res.send(m);
    }

    async function show(req, res, next) {
        let _id = req.params._id;
        let m = await Model.getById(_id);
        res.json(m);
    }

    async function update(req, res, next) {
        let m = extractFields(req, updateFields);
        delete m.no;
        let r = await Model.update(req.params._id, m);
        sendMgResult(res, r);
    }

    async function destroy(req, res, next) {
        if (ChildModel) {
            let filter = {[parentFieldInChild]: req.params._id};
            let childrenExists = await ChildModel.exists(filter);
            if (childrenExists) {
                let message = childExistsMsg || 'Child Resource Exists';
                res.send({ok: 0, message: message});
                return;
            }
        }
        let r = await Model.remove(req.params._id);
        sendMgResult(res, r);
    }

    [index, create, show, update, destroy] =
        wrapAsync(index, create, show, update, destroy);

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
