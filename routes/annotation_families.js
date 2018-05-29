let express = require('express');
let router = express.Router();

let {wrapAsyncOne} = require('../common/helper');
let AnnotationGroup = require('../models/annotation_group');
let AnnotationFamily = require('../models/annotation_family');


async function index(req, res, next) {
    let afs = await AnnotationFamily.find({status: {$ne: 'B'}});
    res.json(afs);
}

function getDetail(req, res, next) {
    let familyId = req.params._id;
    let fp = AnnotationFamily.getById(familyId);
    let gp = AnnotationGroup.coll()
        .find({familyId})
        .sort({no: 1})
        .project({no: 0})
        .toArray();

    Promise.all([fp, gp])
        .then(function ([family, groups]) {
            if (family || family.status === 'B') {
                family.groups = groups;
            }
            res.json(family);
        }).catch(next);
}


router.get('/', wrapAsyncOne(index));
router.get('/:_id/detail', getDetail);


module.exports = router;
