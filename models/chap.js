const {ObjectID} = require('mongodb');
const {simpleCurd} = require('./db');

let Chap = simpleCurd('chaps');

let requiredFields = ['bookId', 'name'],
    updateFields = ['name', 'zhName', 'no', 'isFree', 'price', 'status', 'memo'],
    createFields = updateFields.concat(['bookId', 'originalId']);

Chap.fields = {requiredFields, updateFields, createFields};

/*
Chap.Statuses = [
    {value: 'E', label: '编辑'},
    {value: 'C', label: '校对'},
    {value: 'P', label: '上线审核'},
    {value: 'R', label: '上线'},
    {value: 'B', label: '备份'},
    {value: 'X', label: '标记为删除'}
];
*/

Chap.releasedChap = function (_id, project = null) {
    if (!project) {
        project = {status: 0};
    }
    if (typeof _id !== 'object') _id = ObjectID(_id);
    return Chap.coll().findOne({_id, status: 'R'}, project);
};

module.exports = Chap;
