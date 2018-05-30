let express = require('express');
let router = express.Router();

let {wrapAsync, idString} = require('../../common/helper');
let restful = require('./common/rest');
let Book = require('../../models/book');
let AnnotationGroup = require('../../models/annotation_group');
let AnnotationFamily = require('../../models/annotation_family');


let handles = restful.simpleHandles(AnnotationFamily);


async function destroy(req, res, next) {
    let familyId = req.params._id;
    let bookExists = await Book.exists({annotationFamilyId: familyId});
    if (bookExists) {
        res.json({ok: 0, message: 'Being in Use.'});
        return;
    }
    await AnnotationFamily.remove(familyId);
    await AnnotationGroup.coll().deleteMany({familyId});
    res.json({ok: 1});
}

handles.destroy = wrapAsync(destroy);


async function candidates(req, res, next) {
    let fas = await AnnotationFamily.coll()
        .find({status: {$ne: 'B'}}, {name: 1})
        .toArray();
    res.json(fas);
}

function getDetail(req, res, next) {
    let familyId = req.params._id;
    let fp = AnnotationFamily.getById(familyId);
    let gp = AnnotationGroup.coll()
        .find({familyId})
        .sort({no: 1})
        .toArray();

    Promise.all([fp, gp])
        .then(function ([family, groups]) {
            if (family) {
                family.groups = groups;
            }
            res.json(family);
        }).catch(next);
}

async function clone(req, res, next) {
    const id = req.params._id;

    let family = await AnnotationFamily.getById(id);
    let cloned = Object.assign({}, family);
    delete cloned._id;
    cloned.name = family.name + '.c';
    cloned.isDefault = false;
    // cloned.status = 'B';
    AnnotationFamily.create(cloned);
    let clonedId = idString(cloned._id);

    let groups = await AnnotationGroup.coll()
        .find({familyId: id})
        .toArray();
    for (let group of groups) {
        let clonedGroup = Object.assign({}, group);
        delete clonedGroup._id;
        clonedGroup.familyId = clonedId;
        await AnnotationGroup.create(clonedGroup);
    }

    res.json(cloned);
}


router.get('/candidates', wrapAsync(candidates));
// router.get('/default', getDefault);
router.get('/:_id/detail', getDetail);
router.post('/:_id/clone', wrapAsync(clone));


restful.restful(router, handles);


module.exports = router;
