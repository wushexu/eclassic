const {simpleCurd} = require('./db');

let AnnotationGroup = simpleCurd('annotation_groups');

// annotations: [{name:'',nameEn:'',dataValue:''}]
let requiredFields = ['familyId', 'name', 'nameEn', 'dataName'],
    updateFields = ['name', 'nameEn', 'dataName', 'tagName', 'cssClass',
        'annotations', 'no'],
    createFields = updateFields.concat(['familyId']);

AnnotationGroup.fields = {requiredFields, updateFields, createFields};

module.exports = AnnotationGroup;
