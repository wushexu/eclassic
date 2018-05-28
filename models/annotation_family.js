const {simpleCurd} = require('./db');

let AnnotationFamily = simpleCurd('annotation_families');

let requiredFields = ['name'],//clonedFromId
    updateFields = requiredFields.concat(['isDefault', 'description', 'status']),
    createFields = updateFields;

AnnotationFamily.fields = {requiredFields, updateFields, createFields};

module.exports = AnnotationFamily;
