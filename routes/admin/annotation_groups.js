let express = require('express');
let router = express.Router();

let restful = require('./common/rest');
let AnnotationGroup = require('../../models/annotation_group');


let handles = restful.simpleHandles(AnnotationGroup);

let {index, create, show, update, destroy} = handles;

router.route('/')
    // .get(index)
    .post(create);

router.route('/:_id')
    .get(show)
    .put(update)
    .delete(destroy);

module.exports = router;
