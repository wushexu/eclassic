let express = require('express');
let router = express.Router();

let {wrapAsyncOne} = require('../common/helper');
let AnnotationGroup = require('../models/annotation_group');
let AnnotationFamily = require('../models/annotation_family');


async function index(req, res, next) {
    let afs = await AnnotationFamily.find({status: {$ne: 'B'}});
    res.json(afs);
}

/*function getDefault(req, res, next) {
    AnnotationFamily.coll()
        .findOne({isDefault: true, status: {$ne: 'B'}})
        .then(af => {
            res.send(af);
        }).catch(next);
}*/


function getDetail(req, res, next) {
    let familyId = req.params._id;
    let fp = AnnotationFamily.coll()
        .findOne({familyId, status: {$ne: 'B'}});
    let gp = AnnotationGroup.coll()
        .find({familyId})
        .sort({no: 1})
        .project({no: 0})
        .toArray();

    Promise.all([fp, gp])
        .then(function ([family, groups]) {
            if (family) {
                family.groups = groups;
            }
            res.json(family);
        }).catch(next);
}


router.get('/', wrapAsyncOne(index));
// router.get('/default', getDefault);
router.get('/:_id/detail', getDetail);


module.exports = router;
