const {ObjectID} = require('mongodb');
const {simpleCurd} = require('./db');

let Book = simpleCurd('books');

let requiredFields = ['name', 'status'],
    updateFields = requiredFields.concat(['zhName', 'author', 'zhAuthor', 'no', 'langType', 'description',
        'annotationFamilyId', 'tags', 'isFree', 'price', 'status', 'visibility', 'memo']),
    createFields = updateFields.concat(['originalId']);

Book.fields = {requiredFields, updateFields, createFields};

/*
Book.LangTypes = [
    {value: 'EZ', label: '英文原著 - 中文译文'},
    {value: 'ZE', label: '英文译文 - 中文原著'},
    {value: 'CZ', label: '文言文/诗词 - 现代文/注释/解析'}
];

Book.Statuses = [
    {value: 'E', label: '编辑'},
    {value: 'C', label: '校对'},
    {value: 'P', label: '上线审核'},
    {value: 'R', label: '上线'},
    {value: 'B', label: '备份'},
    {value: 'X', label: '标记为删除'}
];

// for book list
Book.Visibilities = [
    {value: 'P', label: '公开可见'},
    {value: 'E', label: '编辑人员可见'},
    {value: 'H', label: '仅管理员可见'}
];
*/

Book.releasedBook = function (_id, project = null) {
    if (!project) {
        project = {status: 0};
    }
    if (typeof _id !== 'object') _id = ObjectID(_id);
    return Book.coll().findOne({_id, status: 'R'}, project);
};

module.exports = Book;
